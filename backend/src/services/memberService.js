import pool from "../config/db.js";
import { generateReferralCode } from "../utils/generateCode.js";

/**
 * Insert a new member and walk up the referral chain updating counters.
 * @param {Object} data  fields matching the members table
 * @returns inserted member id
 */
export const addMember = async (data) => {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // -------------------------------
    // 1️⃣ Extract data (FIXED)
    // -------------------------------
    const {
      firstName,
      middleName,
      lastName,
      email,
      contact,
      address,
      cityId,
      stateId,
      passwordHash,
      referralCode, // ✅ correct name
      leg,
    } = data;

    // -------------------------------
    // 2️⃣ Resolve referrer (FIXED)
    // -------------------------------
    let referrerId = null;

    if (referralCode) {
      const [[ref]] = await conn.query(
        `SELECT id FROM members WHERE referral_code = ?`,
        [referralCode],
      );

      if (!ref) {
        throw new Error("Invalid referral code");
      }

      referrerId = ref.id;

      if (!leg) {
        throw new Error("Leg is required when referral code is used");
      }
    }

    // -------------------------------
    // 3️⃣ Generate unique referral code
    // -------------------------------
    let newCode;
    let exists = true;

    while (exists) {
      newCode = generateReferralCode();

      const [[row]] = await conn.query(
        `SELECT id FROM members WHERE referral_code = ?`,
        [newCode],
      );

      exists = !!row;
    }

    // -------------------------------
    // 4️⃣ Insert member (FIXED)
    // -------------------------------
    const [ins] = await conn.query(
      `INSERT INTO members
       (first_name, middle_name, last_name, email, contact, address,
        city_id, state_id, password_hash, referrer_id, leg, referral_code)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        firstName,
        middleName,
        lastName,
        email,
        contact,
        address,
        cityId,
        stateId,
        passwordHash,
        referrerId,
        leg,
        newCode, // ✅ correct
      ],
    );

    const newId = ins.insertId;

    // -------------------------------
    // 5️⃣ Update counters (FIXED)
    // -------------------------------
    let parentId = referrerId;
    let curLeg = leg;

    while (parentId) {
      let sql = `UPDATE members SET total_subtree = total_subtree + 1`;
      const params = [];

      if (curLeg === "L") {
        sql += `, total_left_leg = total_left_leg + 1`;
      }

      if (curLeg === "R") {
        sql += `, total_right_leg = total_right_leg + 1`;
      }

      sql += ` WHERE id = ?`;
      params.push(parentId);

      await conn.query(sql, params);

      const [[row]] = await conn.query(
        `SELECT referrer_id, leg FROM members WHERE id = ?`,
        [parentId],
      );

      parentId = row.referrer_id;
      curLeg = row.leg;
    }

    await conn.commit();
    return newId;
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
};

export const updateMemberInfo = async (memberId, payload) => {
  const fields = [];
  const values = [];

  // only allow these columns to be changed via this route
  const updatable = [
    "first_name",
    "middle_name",
    "last_name",
    "email",
    "contact",
    "address",
    "city_id",
    "state_id",
  ];

  for (const col of updatable) {
    if (payload[col] !== undefined) {
      fields.push(`${col} = ?`);
      values.push(payload[col]);
    }
  }

  if (fields.length === 0) return; // nothing to do

  values.push(memberId);
  await pool.query(
    `UPDATE members SET ${fields.join(", ")} WHERE id = ?`,
    values,
  );
};

export const deleteMemberCascade = async (memberId) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1️⃣ Determine size of subtree to be deleted
    const [[sizeRow]] = await conn.query(
      `SELECT COUNT(*) AS sz FROM (
         WITH RECURSIVE sub AS (
           SELECT id FROM members WHERE id = ?
           UNION ALL
           SELECT m.id FROM members m
           JOIN sub s ON m.referrer_id = s.id
         )
         SELECT id FROM sub
       ) t`,
      [memberId],
    );
    const subtreeSize = sizeRow.sz;

    // 2️⃣ Fetch old ancestry chain (needed to subtract counters)
    const [[info]] = await conn.query(
      `SELECT referrer_id, leg FROM members WHERE id = ?`,
      [memberId],
    );
    let parentId = info.referrer_id;
    let curLeg = info.leg;

    while (parentId) {
      const decLeft =
        curLeg === "L" ? "total_left_leg = total_left_leg - ?," : "";
      const decRight =
        curLeg === "R" ? "total_right_leg = total_right_leg - ?," : "";

      await conn.query(
        `UPDATE members
         SET total_subtree = total_subtree - ?,
             ${decLeft}
             ${decRight}
             total_subtree = total_subtree - 0
         WHERE id = ?`,
        [subtreeSize, subtreeSize, subtreeSize, parentId],
      );

      const [[row]] = await conn.query(
        `SELECT referrer_id, leg FROM members WHERE id = ?`,
        [parentId],
      );
      parentId = row.referrer_id;
      curLeg = row.leg;
    }

    // 3️⃣ Delete the whole subtree
    await conn.query(
      `WITH RECURSIVE sub AS (
         SELECT id FROM members WHERE id = ?
         UNION ALL
         SELECT m.id FROM members m
         JOIN sub s ON m.referrer_id = s.id
       )
       DELETE FROM members WHERE id IN (SELECT id FROM sub)`,
      [memberId],
    );

    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
};

/**
 * Move a member to a new parent (or make it a root).
 * newParentId can be null (root). newLeg must be 'L'|'R' when parent exists.
 */
export const moveMember = async (memberId, newParentId, newLeg) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // -------------------------------------------------
    // 1️⃣ Get the whole subtree size (including the node itself)
    // -------------------------------------------------
    const [[sizeRow]] = await conn.query(
      `SELECT COUNT(*) AS sz FROM (
         WITH RECURSIVE sub AS (
           SELECT id FROM members WHERE id = ?
           UNION ALL
           SELECT m.id FROM members m
           JOIN sub s ON m.referrer_id = s.id
         )
         SELECT id FROM sub
       ) t`,
      [memberId],
    );
    const subtreeSize = sizeRow.sz; // number of nodes we will move

    // -------------------------------------------------
    // 2️⃣ Fetch old ancestry chain (to decrement counters)
    // -------------------------------------------------
    const [[oldInfo]] = await conn.query(
      `SELECT referrer_id, leg FROM members WHERE id = ?`,
      [memberId],
    );
    let oldParentId = oldInfo.referrer_id;
    let oldLeg = oldInfo.leg;

    // walk up old chain, subtract counters
    while (oldParentId) {
      let sql = `UPDATE members
           SET total_subtree = total_subtree - ?`;
      const params = [subtreeSize];

      if (oldLeg === "L") {
        sql += `, total_left_leg = total_left_leg - ?`;
        params.push(subtreeSize);
      }

      if (oldLeg === "R") {
        sql += `, total_right_leg = total_right_leg - ?`;
        params.push(subtreeSize);
      }

      sql += ` WHERE id = ?`;
      params.push(oldParentId);

      await conn.query(sql, params);

      const [[row]] = await conn.query(
        `SELECT referrer_id, leg FROM members WHERE id = ?`,
        [oldParentId],
      );
      oldParentId = row.referrer_id;
      oldLeg = row.leg;
    }

    // -------------------------------------------------
    // 3️⃣ Update the node itself (new parent & leg)
    // -------------------------------------------------
    await conn.query(
      `UPDATE members SET referrer_id = ?, leg = ? WHERE id = ?`,
      [newParentId, newLeg, memberId],
    );

    // -------------------------------------------------
    // 4️⃣ Walk up the new chain, add counters
    // -------------------------------------------------
    let curParent = newParentId;
    let curLeg = newLeg;
    while (curParent) {
      let sql = `UPDATE members
           SET total_subtree = total_subtree + ?`;
      const params = [subtreeSize];

      if (curLeg === "L") {
        sql += `, total_left_leg = total_left_leg + ?`;
        params.push(subtreeSize);
      }

      if (curLeg === "R") {
        sql += `, total_right_leg = total_right_leg + ?`;
        params.push(subtreeSize);
      }

      sql += ` WHERE id = ?`;
      params.push(curParent);

      await conn.query(sql, params);

      const [[row]] = await conn.query(
        `SELECT referrer_id, leg FROM members WHERE id = ?`,
        [curParent],
      );
      curParent = row.referrer_id;
      curLeg = row.leg;
    }

    // -------------------------------------------------
    // 5️⃣ Depth (SAFE BFS version)
    // -------------------------------------------------

    const [[parentRow]] = newParentId
      ? await conn.query(`SELECT depth FROM members WHERE id = ? FOR UPDATE`, [
          newParentId,
        ])
      : [null];

    const newDepth = parentRow ? parentRow.depth + 1 : 0;

    // BFS update (no big locks)
    const queue = [{ id: memberId, depth: newDepth }];

    while (queue.length) {
      const { id, depth } = queue.shift();

      // update current node
      await conn.query(`UPDATE members SET depth = ? WHERE id = ?`, [
        depth,
        id,
      ]);

      // get children
      const [children] = await conn.query(
        `SELECT id FROM members WHERE referrer_id = ?`,
        [id],
      );

      for (const child of children) {
        queue.push({ id: child.id, depth: depth + 1 });
      }
    }
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
};

/**
 * Get a (possibly filtered) list of members.
 * Accepts a plain object with optional keys:
 *   search, cityId, stateId, fromDate, toDate, page, limit
 */
export const listMembers = async (opts = {}) => {
  const {
    search,
    cityId,
    stateId,
    fromDate,
    toDate,
    page = 1,
    limit = 20,
  } = opts;

  let sql = `SELECT m.*,
                    c.name AS city,
                    s.name AS state
             FROM members m
             LEFT JOIN cities c ON m.city_id = c.id
             LEFT JOIN states s ON m.state_id = s.id
             WHERE 1=1`;
  const params = [];

  if (search) {
    sql += ` AND (m.first_name LIKE ? OR m.last_name LIKE ? OR
                  m.email LIKE ? OR m.contact LIKE ?)`;
    const like = `%${search}%`;
    params.push(like, like, like, like);
  }
  if (cityId) {
    sql += ` AND m.city_id = ?`;
    params.push(cityId);
  }
  if (stateId) {
    sql += ` AND m.state_id = ?`;
    params.push(stateId);
  }
  if (fromDate) {
    sql += ` AND m.created_at >= ?`;
    params.push(fromDate);
  }
  if (toDate) {
    sql += ` AND m.created_at <= ?`;
    params.push(toDate);
  }

  sql += ` ORDER BY m.created_at IS NOT NULL, m.id ASC LIMIT ?, ?`;
  params.push((page - 1) * limit, +limit);

  const [rows] = await pool.query(sql, params);
  return rows;
};

/**
 * Return the whole subtree (including the root node) for a member.
 * Uses MySQL 8 recursive CTE.
 */
export const getMemberTree = async (memberId) => {
  const [rows] = await pool.query(
    `
    WITH RECURSIVE subtree AS (
      SELECT * FROM members WHERE id = ?
      UNION ALL
      SELECT m.* FROM members m
      JOIN subtree s ON m.referrer_id = s.id
    )
    SELECT * FROM subtree ORDER BY leg, id;
  `,
    [memberId],
  );
  return rows;
};

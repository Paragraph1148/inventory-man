import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

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

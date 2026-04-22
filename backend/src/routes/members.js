import express from "express";
import { requireAdmin } from "../middleware/auth.js";
import bcrypt from "bcrypt";
import {
  addMember,
  listMembers,
  getMemberTree,
} from "../services/memberService.js";
import { body, validationResult } from "express-validator";

const router = express.Router();

/* -------------------------------------------------
   GET /members – list with filters / pagination
   ------------------------------------------------- */
router.get("/", requireAdmin, async (req, res, next) => {
  try {
    const members = await listMembers(req.query);
    res.json(members);
  } catch (e) {
    next(e);
  }
});

/* -------------------------------------------------
   POST /members – create a new member
   ------------------------------------------------- */
router.post("/", requireAdmin, async (req, res, next) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      email,
      contact,
      address,
      cityId,
      stateId,
      password,
      referralCode,
      leg,
    } = req.body;

    if (!firstName || !lastName || !email || !contact || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (referralCode && !leg) {
      return res.status(400).json({
        error: "Leg is required when referral code is used",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const id = await addMember({
      firstName,
      middleName,
      lastName,
      email,
      contact,
      address,
      cityId,
      stateId,
      passwordHash,
      referralCode, // ✅ IMPORTANT
      leg,
    });

    res.json({ msg: "Member created", id });
  } catch (e) {
    next(e);
  }
});

/* -------------------------------------------------
   GET /members/:id/tree – full referral subtree
   ------------------------------------------------- */
router.get("/:id/tree", requireAdmin, async (req, res, next) => {
  try {
    const tree = await getMemberTree(req.params.id);
    res.json(tree);
  } catch (e) {
    next(e);
  }
});
import {
  updateMemberInfo,
  moveMember,
  deleteMemberCascade,
} from "../services/memberService.js";
import { param } from "express-validator";

/* -------------------------------------------------
   PATCH /members/:id – update personal fields only
   ------------------------------------------------- */
router.patch(
  "/:id",
  requireAdmin,
  param("id").isInt(),
  body("email").optional().isEmail(),
  body("contact").optional().isString(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });

      await updateMemberInfo(req.params.id, {
        first_name: req.body.firstName,
        middle_name: req.body.middleName,
        last_name: req.body.lastName,
        email: req.body.email,
        contact: req.body.contact,
        address: req.body.address,
        city_id: req.body.cityId,
        state_id: req.body.stateId,
      });
      res.json({ msg: "Member updated" });
    } catch (e) {
      next(e);
    }
  },
);

/* -------------------------------------------------
   POST /members/:id/move – change referrer/leg
   ------------------------------------------------- */
router.post(
  "/:id/move",
  requireAdmin,
  param("id").isInt(),
  body("newReferrerId").optional().isInt(),
  body("newLeg").optional().isIn(["L", "R"]),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });

      const memberId = parseInt(req.params.id, 10);
      const newReferrerId = req.body.newReferrerId ?? null;
      const newLeg = req.body.newLeg;

      await moveMember(memberId, newReferrerId, newLeg);
      res.json({ msg: "Member moved" });
    } catch (e) {
      next(e);
    }
  },
);

/* -------------------------------------------------
   DELETE /members/:id – cascade delete
   ------------------------------------------------- */
router.delete(
  "/:id",
  requireAdmin,
  param("id").isInt(),
  async (req, res, next) => {
    try {
      await deleteMemberCascade(req.params.id);
      res.json({ msg: "Member and its subtree deleted" });
    } catch (e) {
      next(e);
    }
  },
);

export default router;

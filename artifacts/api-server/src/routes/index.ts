import { Router, type IRouter } from "express";
import healthRouter from "./health";
import casesRouter from "./cases";
import custodyRouter from "./custody";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/cases", casesRouter);
router.use("/custody", custodyRouter);

export default router;

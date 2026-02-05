import { ConfigService } from "../services/config";
import { runtimeAtom } from "../services/runtime";

export const configAtom = runtimeAtom.atom(ConfigService);

export type AppSecurityMode =
  | "force_update"
  | "incident_lockdown"
  | "maintenance"
  | "normal"
  | "read_only";

export type AppSecurityConfig = {
  disabledFeatures: string[];
  incidentId?: string;
  isBlockingMode: boolean;
  message?: string;
  minMobileBuild?: string;
  mode: AppSecurityMode;
  statusUrl?: string;
  supportEmail?: string;
  updatedAt?: string;
};

export type AppConfig = {
  security: AppSecurityConfig;
};

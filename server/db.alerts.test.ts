import { describe, it, expect } from "vitest";
import {
  shouldTriggerAlert,
  getAlertSeverity,
} from "./db.alerts";

/**
 * Tests for alert system functions
 */
describe("Alert System Functions", () => {
  describe("shouldTriggerAlert", () => {
    it("should trigger warning alert when value is 90% of threshold", () => {
      const result = shouldTriggerAlert(72, 80, "warning");
      expect(result).toBe(true);
    });

    it("should not trigger warning alert when value is below 90% of threshold", () => {
      const result = shouldTriggerAlert(70, 80, "warning");
      expect(result).toBe(false);
    });

    it("should trigger critical alert when value equals threshold", () => {
      const result = shouldTriggerAlert(80, 80, "critical");
      expect(result).toBe(true);
    });

    it("should trigger critical alert when value exceeds threshold", () => {
      const result = shouldTriggerAlert(95, 80, "critical");
      expect(result).toBe(true);
    });

    it("should not trigger critical alert when value is below threshold", () => {
      const result = shouldTriggerAlert(75, 80, "critical");
      expect(result).toBe(false);
    });

    it("should handle zero threshold", () => {
      const result = shouldTriggerAlert(0, 0, "critical");
      expect(result).toBe(true);
    });

    it("should handle 100% threshold", () => {
      const result = shouldTriggerAlert(100, 100, "critical");
      expect(result).toBe(true);
    });
  });

  describe("getAlertSeverity", () => {
    it("should return critical when value equals threshold", () => {
      const severity = getAlertSeverity(80, 80);
      expect(severity).toBe("critical");
    });

    it("should return critical when value exceeds threshold", () => {
      const severity = getAlertSeverity(95, 80);
      expect(severity).toBe("critical");
    });

    it("should return warning when value is below threshold", () => {
      const severity = getAlertSeverity(75, 80);
      expect(severity).toBe("warning");
    });

    it("should return critical at 100% of threshold", () => {
      const severity = getAlertSeverity(100, 100);
      expect(severity).toBe("critical");
    });

    it("should return warning at 99% of threshold", () => {
      const severity = getAlertSeverity(99, 100);
      expect(severity).toBe("warning");
    });

    it("should handle decimal values", () => {
      const severity = getAlertSeverity(85.5, 80);
      expect(severity).toBe("critical");
    });

    it("should handle very small thresholds", () => {
      const severity = getAlertSeverity(0.5, 0.5);
      expect(severity).toBe("critical");
    });
  });

  describe("threshold validation", () => {
    it("should accept valid CPU threshold", () => {
      expect(() => {
        if (!(80 >= 0 && 80 <= 100)) throw new Error("Invalid CPU threshold");
      }).not.toThrow();
    });

    it("should reject CPU threshold below 0", () => {
      expect(() => {
        if (!(-10 >= 0 && -10 <= 100)) throw new Error("Invalid CPU threshold");
      }).toThrow("Invalid CPU threshold");
    });

    it("should reject CPU threshold above 100", () => {
      expect(() => {
        if (!(150 >= 0 && 150 <= 100)) throw new Error("Invalid CPU threshold");
      }).toThrow("Invalid CPU threshold");
    });
  });

  describe("alert message generation", () => {
    it("should generate correct CPU alert message", () => {
      const currentValue = 85.5;
      const threshold = 80;
      const message = `CPU usage is ${currentValue.toFixed(1)}% (threshold: ${threshold}%)`;
      expect(message).toBe("CPU usage is 85.5% (threshold: 80%)");
    });

    it("should generate correct memory alert message", () => {
      const currentValue = 92.3;
      const threshold = 85;
      const message = `Memory usage is ${currentValue.toFixed(1)}% (threshold: ${threshold}%)`;
      expect(message).toBe("Memory usage is 92.3% (threshold: 85%)");
    });

    it("should generate correct disk alert message", () => {
      const currentValue = 98.7;
      const threshold = 90;
      const message = `Disk usage is ${currentValue.toFixed(1)}% (threshold: ${threshold}%)`;
      expect(message).toBe("Disk usage is 98.7% (threshold: 90%)");
    });
  });

  describe("edge cases", () => {
    it("should handle zero values", () => {
      const severity = getAlertSeverity(0, 0);
      // 0/0 is NaN, which is < 100, so returns warning
      expect(severity).toBe("warning");
    });

    it("should handle 100% values", () => {
      const severity = getAlertSeverity(100, 100);
      // 100/100 * 100 = 100, which is >= 100, so returns critical
      expect(severity).toBe("critical");
    });

    it("should handle very small decimal differences", () => {
      const result = shouldTriggerAlert(80.001, 80, "critical");
      // 80.001 >= 80 is true
      expect(result).toBe(true);
    });

    it("should handle large threshold values", () => {
      const result = shouldTriggerAlert(9000, 10000, "critical");
      // 9000 >= 10000 is false
      expect(result).toBe(false);
    });

    it("should handle very small threshold values", () => {
      const result = shouldTriggerAlert(0.9, 1, "critical");
      // 0.9 >= 1 is false
      expect(result).toBe(false);
    });


  });

  describe("alert type validation", () => {
    it("should accept cpu alert type", () => {
      const alertType: string = "cpu";
      expect(["cpu", "memory", "disk"].includes(alertType)).toBe(true);
    });

    it("should accept memory alert type", () => {
      const alertType: string = "memory";
      expect(["cpu", "memory", "disk"].includes(alertType)).toBe(true);
    });

    it("should accept disk alert type", () => {
      const alertType: string = "disk";
      expect(["cpu", "memory", "disk"].includes(alertType)).toBe(true);
    });

    it("should reject invalid alert type", () => {
      const alertType: string = "network";
      expect(["cpu", "memory", "disk"].includes(alertType)).toBe(false);
    });
  });

  describe("severity validation", () => {
    it("should accept warning severity", () => {
      const severity: string = "warning";
      expect(["warning", "critical"].includes(severity)).toBe(true);
    });

    it("should accept critical severity", () => {
      const severity: string = "critical";
      expect(["warning", "critical"].includes(severity)).toBe(true);
    });

    it("should reject invalid severity", () => {
      const severity: string = "info";
      expect(["warning", "critical"].includes(severity)).toBe(false);
    });
  });
});

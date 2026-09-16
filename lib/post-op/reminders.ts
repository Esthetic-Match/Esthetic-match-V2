export type PostOpReminderType =
  | "DO"
  | "DONT"
  | "GENERAL";

export type PostOpReminderState =
  | "UPCOMING"
  | "ACTIVE"
  | "EXPIRED";

type ValidateReminderInput = {
  type: PostOpReminderType;

  text: unknown;

  startsAfterHours: unknown;
  endsAfterHours: unknown;

  notificationsEnabled: unknown;
  repeatEveryHours: unknown;

  isPinned: unknown;
};

type ReminderValidationResult =
  | {
      valid: true;
    }
  | {
      valid: false;
      error: string;
    };

/* ═══════════════════════════════════════════════════════════════
   VALIDATION
═══════════════════════════════════════════════════════════════ */

export function validatePostOpTemplateReminder(
  input: ValidateReminderInput,
): ReminderValidationResult {
  const {
    type,
    text,
    startsAfterHours,
    endsAfterHours,
    notificationsEnabled,
    repeatEveryHours,
    isPinned,
  } = input;

  /* ─────────────────────────────────────
     TYPE
  ───────────────────────────────────── */

  if (
    type !== "DO" &&
    type !== "DONT" &&
    type !== "GENERAL"
  ) {
    return {
      valid: false,

      error:
        "Reminder type must be DO, DONT or GENERAL.",
    };
  }

  /* ─────────────────────────────────────
     TEXT
  ───────────────────────────────────── */

  if (
    typeof text !== "string" ||
    !text.trim()
  ) {
    return {
      valid: false,

      error:
        "Reminder text is required.",
    };
  }

  /* ─────────────────────────────────────
     ACTIVATION OFFSET
  ───────────────────────────────────── */

  if (
    !Number.isInteger(
      startsAfterHours,
    ) ||
    Number(startsAfterHours) < 0
  ) {
    return {
      valid: false,

      error:
        "startsAfterHours must be a non-negative integer.",
    };
  }

  /* ─────────────────────────────────────
     EXPIRATION OFFSET
  ───────────────────────────────────── */

  if (
    endsAfterHours !== null &&
    endsAfterHours !== undefined
  ) {
    if (
      !Number.isInteger(
        endsAfterHours,
      ) ||
      Number(endsAfterHours) < 0
    ) {
      return {
        valid: false,

        error:
          "endsAfterHours must be null or a non-negative integer.",
      };
    }

    if (
      Number(endsAfterHours) <
      Number(startsAfterHours)
    ) {
      return {
        valid: false,

        error:
          "endsAfterHours cannot be earlier than startsAfterHours.",
      };
    }
  }

  /* ─────────────────────────────────────
     NOTIFICATIONS
  ───────────────────────────────────── */

  if (
    typeof notificationsEnabled !==
    "boolean"
  ) {
    return {
      valid: false,

      error:
        "notificationsEnabled must be a boolean.",
    };
  }

  if (
    repeatEveryHours !== null &&
    repeatEveryHours !== undefined
  ) {
    if (
      !Number.isInteger(
        repeatEveryHours,
      ) ||
      Number(repeatEveryHours) <= 0
    ) {
      return {
        valid: false,

        error:
          "repeatEveryHours must be null or a positive integer.",
      };
    }

    if (!notificationsEnabled) {
      return {
        valid: false,

        error:
          "repeatEveryHours cannot be set when notifications are disabled.",
      };
    }
  }

  if (
    typeof isPinned !== "boolean"
  ) {
    return {
      valid: false,

      error:
        "isPinned must be a boolean.",
    };
  }

  return {
    valid: true,
  };
}

/* ═══════════════════════════════════════════════════════════════
   TYPE HELPERS
═══════════════════════════════════════════════════════════════ */

export function isPostOpDoReminder(
  type: PostOpReminderType,
) {
  return type === "DO";
}

export function isPostOpDontReminder(
  type: PostOpReminderType,
) {
  return type === "DONT";
}

export function isPostOpGeneralReminder(
  type: PostOpReminderType,
) {
  return type === "GENERAL";
}

/* ═══════════════════════════════════════════════════════════════
   DATE HELPERS
═══════════════════════════════════════════════════════════════ */

export function addHours(
  date: Date,
  hours: number,
) {
  return new Date(
    date.getTime() +
      hours * 60 * 60 * 1000,
  );
}

/**
 * Converts template offsets into actual
 * patient PostOp dates.
 *
 * Example:
 *
 * procedurePerformedAt = Sep 1 10:00
 * startsAfterHours = 24
 *
 * startsAt = Sep 2 10:00
 */
export function resolvePostOpReminderDates({
  procedurePerformedAt,
  startsAfterHours,
  endsAfterHours,
}: {
  procedurePerformedAt: Date;
  startsAfterHours: number;
  endsAfterHours: number | null;
}) {
  const startsAt = addHours(
    procedurePerformedAt,
    startsAfterHours,
  );

  const endsAt =
    endsAfterHours === null
      ? null
      : addHours(
          procedurePerformedAt,
          endsAfterHours,
        );

  return {
    startsAt,
    endsAt,
  };
}

/* ═══════════════════════════════════════════════════════════════
   REMINDER STATE
═══════════════════════════════════════════════════════════════ */

export function getPostOpReminderState(
  reminder: {
    startsAt: Date;
    endsAt: Date | null;
    isActive?: boolean;
  },
  now = new Date(),
): PostOpReminderState {
  /*
   * Case reminder was explicitly disabled.
   */
  if (
    reminder.isActive === false
  ) {
    return "EXPIRED";
  }

  /*
   * Reminder hasn't started yet.
   */
  if (now < reminder.startsAt) {
    return "UPCOMING";
  }

  /*
   * Reminder has a defined end and
   * that time has passed.
   */
  if (
    reminder.endsAt &&
    now >= reminder.endsAt
  ) {
    return "EXPIRED";
  }

  return "ACTIVE";
}

export function isPostOpReminderActive(
  reminder: {
    startsAt: Date;
    endsAt: Date | null;
    isActive?: boolean;
  },
  now = new Date(),
) {
  return (
    getPostOpReminderState(
      reminder,
      now,
    ) === "ACTIVE"
  );
}

export function isPostOpReminderUpcoming(
  reminder: {
    startsAt: Date;
    endsAt: Date | null;
    isActive?: boolean;
  },
  now = new Date(),
) {
  return (
    getPostOpReminderState(
      reminder,
      now,
    ) === "UPCOMING"
  );
}

export function isPostOpReminderExpired(
  reminder: {
    startsAt: Date;
    endsAt: Date | null;
    isActive?: boolean;
  },
  now = new Date(),
) {
  return (
    getPostOpReminderState(
      reminder,
      now,
    ) === "EXPIRED"
  );
}
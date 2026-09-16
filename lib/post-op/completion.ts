import type {
  PostOpCaseStep,
} from "./types";

export type PostOpStepState =
  | "UPCOMING"
  | "ACTIVE"
  | "COMPLETED"
  | "SKIPPED";

type CompletionFields = Pick<
  PostOpCaseStep,
  | "completionMode"
  | "startsAt"
  | "completesAt"
  | "completedAt"
  | "skippedAt"
>;

type TemplateCompletionInput = {
  completionMode:
    | "TIME_BASED"
    | "MANUAL";

  startsAfterHours: number;

  completesAfterHours:
    | number
    | null;
};

/* ═══════════════════════════════════════════════════════════════
   TEMPLATE VALIDATION
═══════════════════════════════════════════════════════════════ */

export function validatePostOpCompletionConfig(
  input: TemplateCompletionInput,
) {
  const {
    completionMode,
    startsAfterHours,
    completesAfterHours,
  } = input;

  if (
    !Number.isInteger(
      startsAfterHours,
    ) ||
    startsAfterHours < 0
  ) {
    return {
      valid: false as const,

      error:
        "startsAfterHours must be a non-negative integer.",
    };
  }

  if (
    completionMode !==
      "TIME_BASED" &&
    completionMode !== "MANUAL"
  ) {
    return {
      valid: false as const,

      error:
        "Invalid completion mode.",
    };
  }

  /*
   * TIME_BASED steps must have an end.
   *
   * Otherwise we would never know when
   * the step has automatically completed.
   */
  if (
    completionMode ===
    "TIME_BASED"
  ) {
    if (
      completesAfterHours === null
    ) {
      return {
        valid: false as const,

        error:
          "TIME_BASED steps require completesAfterHours.",
      };
    }

    if (
      !Number.isInteger(
        completesAfterHours,
      ) ||
      completesAfterHours <=
        startsAfterHours
    ) {
      return {
        valid: false as const,

        error:
          "completesAfterHours must be greater than startsAfterHours.",
      };
    }
  }

  /*
   * MANUAL steps do not require an
   * automatic completion time.
   *
   * They may still optionally define one
   * for display purposes if desired.
   */
  if (
    completionMode === "MANUAL" &&
    completesAfterHours !== null
  ) {
    if (
      !Number.isInteger(
        completesAfterHours,
      ) ||
      completesAfterHours <
        startsAfterHours
    ) {
      return {
        valid: false as const,

        error:
          "completesAfterHours cannot be earlier than startsAfterHours.",
      };
    }
  }

  return {
    valid: true as const,
  };
}

/* ═══════════════════════════════════════════════════════════════
   STEP STATE
═══════════════════════════════════════════════════════════════ */

export function getPostOpStepState(
  step: CompletionFields,
  now = new Date(),
): PostOpStepState {
  /*
   * Explicit skip always wins.
   */
  if (step.skippedAt) {
    return "SKIPPED";
  }

  /*
   * Explicit completion always wins.
   */
  if (step.completedAt) {
    return "COMPLETED";
  }

  /*
   * Step hasn't started yet.
   */
  if (now < step.startsAt) {
    return "UPCOMING";
  }

  /*
   * TIME_BASED steps automatically become
   * completed once their completion date passes.
   */
  if (
    step.completionMode ===
      "TIME_BASED" &&
    step.completesAt &&
    now >= step.completesAt
  ) {
    return "COMPLETED";
  }

  /*
   * MANUAL steps remain active indefinitely
   * until completedAt or skippedAt is set.
   */
  return "ACTIVE";
}

/* ═══════════════════════════════════════════════════════════════
   CONVENIENCE HELPERS
═══════════════════════════════════════════════════════════════ */

export function isPostOpStepCompleted(
  step: CompletionFields,
  now = new Date(),
) {
  return (
    getPostOpStepState(
      step,
      now,
    ) === "COMPLETED"
  );
}

export function isPostOpStepResolved(
  step: CompletionFields,
  now = new Date(),
) {
  const state =
    getPostOpStepState(
      step,
      now,
    );

  return (
    state === "COMPLETED" ||
    state === "SKIPPED"
  );
}

export function isPostOpStepActive(
  step: CompletionFields,
  now = new Date(),
) {
  return (
    getPostOpStepState(
      step,
      now,
    ) === "ACTIVE"
  );
}

export function canManuallyCompletePostOpStep(
  step: CompletionFields,
) {
  return (
    step.completionMode ===
      "MANUAL" &&
    !step.completedAt &&
    !step.skippedAt
  );
}
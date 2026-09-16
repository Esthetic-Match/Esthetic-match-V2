export type PostOpBlockType =
  | "TEXT"
  | "IMAGE"
  | "VIDEO"
  | "BOOKING";

export type PostOpBookingType =
  | "IN_CLINIC"
  | "ONLINE"
  | "EITHER";

type ValidatePostOpBlockInput = {
  type: PostOpBlockType;

  text?: unknown;

  objectPath?: unknown;
  externalUrl?: unknown;
  mediaAlt?: unknown;

  bookingType?: unknown;
  bookingUrl?: unknown;
  buttonLabel?: unknown;
};

type ValidationResult =
  | {
      valid: true;
    }
  | {
      valid: false;
      error: string;
    };

export function validatePostOpBlock(
  input: ValidatePostOpBlockInput,
): ValidationResult {
  const {
    type,
    text,
    objectPath,
    externalUrl,
    bookingType,
    bookingUrl,
    buttonLabel,
  } = input;

  if (
    type !== "TEXT" &&
    type !== "IMAGE" &&
    type !== "VIDEO" &&
    type !== "BOOKING"
  ) {
    return {
      valid: false,
      error:
        "Block type must be TEXT, IMAGE, VIDEO or BOOKING.",
    };
  }

  if (type === "TEXT") {
    if (
      typeof text !== "string" ||
      !text.trim()
    ) {
      return {
        valid: false,
        error:
          "TEXT blocks require text.",
      };
    }

    return {
      valid: true,
    };
  }

  if (type === "IMAGE") {
    if (
      typeof objectPath !== "string" ||
      !objectPath.trim()
    ) {
      return {
        valid: false,
        error:
          "IMAGE blocks require an objectPath.",
      };
    }

    return {
      valid: true,
    };
  }

  if (type === "VIDEO") {
    /*
     * For now PostOp videos use external URLs.
     *
     * We can add uploaded videos later without
     * changing the block model.
     */
    if (
      typeof externalUrl !== "string" ||
      !externalUrl.trim()
    ) {
      return {
        valid: false,
        error:
          "VIDEO blocks require an externalUrl.",
      };
    }

    try {
      new URL(externalUrl);
    } catch {
      return {
        valid: false,
        error:
          "VIDEO externalUrl must be a valid URL.",
      };
    }

    return {
      valid: true,
    };
  }

  if (type === "BOOKING") {
    if (
      bookingType !== "IN_CLINIC" &&
      bookingType !== "ONLINE" &&
      bookingType !== "EITHER"
    ) {
      return {
        valid: false,
        error:
          "BOOKING blocks require a valid bookingType.",
      };
    }

    if (
      buttonLabel !== undefined &&
      buttonLabel !== null &&
      typeof buttonLabel !== "string"
    ) {
      return {
        valid: false,
        error:
          "buttonLabel must be a string.",
      };
    }

    if (
      bookingUrl !== undefined &&
      bookingUrl !== null &&
      bookingUrl !== ""
    ) {
      if (typeof bookingUrl !== "string") {
        return {
          valid: false,
          error:
            "bookingUrl must be a string.",
        };
      }

      try {
        new URL(bookingUrl);
      } catch {
        return {
          valid: false,
          error:
            "bookingUrl must be a valid URL.",
        };
      }
    }

    return {
      valid: true,
    };
  }

  return {
    valid: false,
    error:
      "Invalid PostOp block.",
  };
}
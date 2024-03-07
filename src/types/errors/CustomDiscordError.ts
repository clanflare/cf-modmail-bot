// Custom Discord Error -> message: string, code: number, stack:

export class CustomDiscordError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CustomDiscordError";
  }

  toJSON() {
    return {
      message: this.message,
    };
  }

  toString() {
    return `CustomDiscordError: ${this.message}`;
  }
}

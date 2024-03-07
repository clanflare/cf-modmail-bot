// Custom Discord Error -> message: string, code: number, stack:

export class CustomDiscordError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CustomDiscordError";
    this.display = true; //later drive this from env depending on debug mode 
  }

  display: boolean;

  toJSON() {
    return {
      message: this.message,
    };
  }

  toString() {
    return `CustomDiscordError: ${this.message}`;
  }
}

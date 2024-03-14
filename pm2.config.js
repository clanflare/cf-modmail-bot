export default {
  name: "moderation-bot", // Name of application
  script: "./index.ts", // Entry point of application
  interpreter: "~/.bun/bin/bun", // Interpreter for application
  error_file: "logs/error.log", // Error log file
  out_file: "logs/out.log", // Output log file
};

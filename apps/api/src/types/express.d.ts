declare global {
  namespace Express {
    interface Request {
      userApiKey?: string;
    }
  }
}

export {};

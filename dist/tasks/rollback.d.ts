declare const rollback: (amount?: number | string, atChildDbPath?: string[]) => Promise<void>;
export default rollback;

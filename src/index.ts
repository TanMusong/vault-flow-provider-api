/**
 * @vault-flow/provider-api
 *
 * TypeScript type definitions for Vault Flow media provider development.
 * This package defines the contract between the Vault Flow core and
 * media providers (e.g., Douyin, X/Twitter, Instagram).
 *
 * Providers implement the {@link VaultProvider} interface and are loaded
 * dynamically at runtime by the server's provider registry.
 */

// ─── Enums ───

/**
 * Task execution result state.
 */
export enum TaskState {
  /** Task execution failed */
  Error = 0,
  /** Task completed successfully */
  Success = 1,
  /** Login session expired */
  LoginExpired = 2,
}

/**
 * Download record status.
 */
export enum DownloadStatus {
  /** Download completed */
  Success = 1,
  /** Download failed */
  Failed = 2,
  /** Download in progress */
  Downloading = 3,
}

/**
 * Media file type.
 */
export enum MediaType {
  /** Video file */
  Video = 'video',
  /** Image file */
  Image = 'image',
  /** Text content */
  Text = 'text',
}

/**
 * Download file status.
 */
export enum FileStatus {
  /** Download in progress */
  Downloading = 'downloading',
  /** Download completed */
  Success = 'success',
  /** Download failed */
  Failed = 'failed',
}

// ─── Localized String ───

/**
 * Localized string - either a plain string or a record of locale to string.
 * Supports multi-language by providing translations as key-value pairs.
 *
 * @example
 * // Plain string
 * "Douyin"
 *
 * // Multi-language
 * { "zh-CN": "抖音", "en-US": "Douyin" }
 */
export type LocalizedString = string | Record<string, string>;

// ─── Download Types ───

/**
 * Information about a single download file.
 */
export interface DownloadFile {
  /** File type (video/image/text) */
  type: MediaType;
  /** Filename including extension */
  filename: string;
  /** Download source URL */
  url: string;
  /** Current file size in bytes */
  fileSize: number;
  /** Expected file size in bytes */
  fileExpectedSize: number;
  /** File download status */
  fileStatus: FileStatus;
}

/**
 * Download record data for creating or updating download records.
 */
export interface DownloadData {
  /** Unique content identifier on the platform */
  id: string;
  /** Content author display name */
  author: string;
  /** Author's platform ID */
  authorId: string;
  /** Content description or title */
  desc: string;
  /** Download status */
  state: DownloadStatus;
  /** Status message (displayed in UI) */
  stateMessage: string;
  /** List of files */
  files: DownloadFile[];
  /** Additional metadata */
  dataJson: Record<string, unknown>;
}

// ─── Provider Storage ───

/**
 * Provider persistent storage interface.
 * Key-value storage scoped to the current task, backed by JSON files on disk.
 * Intended for provider-internal data (e.g., cursors, caches), not for task config.
 */
export interface ProviderStorage {
  /**
   * Get a value by key.
   * @param key - Storage key
   * @returns Stored value, or undefined if not found
   */
  get<T = unknown>(key: string): T | undefined;

  /**
   * Set a value by key.
   * @param key - Storage key
   * @param value - Value to store
   */
  set<T = unknown>(key: string, value: T): void;

  /**
   * Remove a value by key.
   * @param key - Storage key
   */
  remove(key: string): void;

  /**
   * Get all storage keys.
   * @returns Array of storage keys
   */
  keys(): string[];

  /**
   * Clear all storage data for this provider.
   */
  clear(): void;
}

// ─── Task Config ───

/**
 * Task configuration stored in the database.
 * Contains all user-configured parameters for a task (cookies, downloadPath, etc.).
 * Providers read this instead of using storage for config.
 */
export interface TaskConfig {
  [key: string]: unknown;
}

// ─── Provider Result Types ───

/**
 * Result of successfully adding a task.
 */
export interface AddTaskResult {
  /** Operation succeeded */
  success: true;
  /** Task display name (typically username) */
  name: string;
}

/**
 * Result of successfully deleting a task.
 */
export interface DeleteTaskResult {
  /** Operation succeeded */
  success: true;
}

/**
 * Task execution result.
 */
export interface ExecuteTaskResult {
  /** Execution result state */
  state: TaskState;
  /** Result message */
  message: string;
  /** Number of successful downloads */
  downloaded: number;
  /** Number of failed downloads */
  failed: number;
  /** Total items processed */
  total: number;
  /** Execution duration in milliseconds */
  duration: number;
}

/**
 * Provider operation failure result.
 * Returned when an operation fails. Server will reject config save on error.
 */
export interface TaskErrorResult {
  /** Operation failed */
  success: false;
  /** Error message */
  message: string;
}

// ─── Provider Context ───

/**
 * Provider context passed during task operations.
 * Contains all necessary utilities and state for a provider to execute its logic.
 */
export interface ProviderContext {
  /** Current task ID */
  taskId: string;

  /**
   * Task configuration from the database.
   * Contains all user-configured parameters (cookies, downloadPath, etc.).
   * Providers should read config from here, not from storage.
   */
  config: TaskConfig;

  /**
   * Persistent storage for provider-internal data (cursors, caches, etc.).
   * Scoped to the current task. Not intended for task config.
   */
  storage: ProviderStorage;

  /** Global download directory path */
  downloadDir: string;

  /** Current app locale (e.g. "zh-CN", "en-US"). Use for localized error messages. */
  locale: string;

  /** App version */
  version: string;

  /**
   * Save the entire task config to the database.
   * Use this to update config during task execution (e.g., rewriting cookies after refresh).
   * @param config - The complete config object to save
   */
  saveConfig(config: TaskConfig): void;

  /**
   * Add a download record.
   * @param data - Download record data
   */
  addDownloadRecord(data: DownloadData): void;

  /**
   * Update an existing download record.
   * @param postId - Content identifier
   * @param data - Fields to update
   */
  updateDownloadRecord(postId: string, data: { state?: DownloadStatus; stateMessage?: string; files?: DownloadFile[] }): void;

  /**
   * Emit download progress event to UI.
   * @param postId - Content identifier
   * @param files - Current file states
   */
  emitDownloadProgress(postId: string, files: DownloadFile[]): void;

  /**
   * Emit task progress event to UI.
   * @param processed - Number of items processed
   * @param total - Total number of items
   */
  emitTaskProgress(processed: number, total: number): void;

  /**
   * Check if a content has been successfully downloaded.
   * @param postId - Content identifier
   * @returns Whether a successful download record exists
   */
  hasSuccessfulDownloadRecord(postId: string): boolean;

  /**
   * Check if a content has any download record.
   * @param postId - Content identifier
   * @returns Whether any download record exists
   */
  hasPostDownloadRecord(postId: string): boolean;

  /**
   * Add a log entry.
   * @param level - Log level (info/warn/error)
   * @param message - Log message
   */
  addLog(level: string, message: string): void;

  /** File system utilities */
  fs: {
    /**
     * Check if a path exists.
     * @param path - File or directory path
     * @returns Whether the path exists
     */
    existsSync(path: string): boolean;
    /**
     * Create a directory.
     * @param path - Directory path
     * @param options - Options (e.g., { recursive: true })
     */
    mkdirSync(path: string, options?: { recursive?: boolean }): void;
    /**
     * Synchronously read file contents.
     * @param path - File path
     * @returns File contents as string
     */
    readFileSync(path: string): string;
    /**
     * Synchronously write file contents.
     * @param path - File path
     * @param data - Data to write
     */
    writeFileSync(path: string, data: string): void;
  };

  /** Path utilities */
  path: {
    /**
     * Join multiple path segments.
     * @param paths - Path segments
     * @returns Joined path
     */
    join(...paths: string[]): string;
  };
}

// ─── Vault Provider Interface ───

/**
 * Main interface that providers must implement.
 * Each provider handles authentication, content fetching, and download
 * logic for a specific media platform.
 */
export interface VaultProvider {
  /**
   * Validate task creation. Checks cookies/credentials and returns task name.
   * Do NOT save config here — server handles persistence after this returns success.
   * @param ctx - Provider context with config from database
   * @returns Task name on success, or error
   */
  addTask(ctx: ProviderContext): Promise<AddTaskResult | TaskErrorResult>;

  /**
   * Delete a task. Server has already verified no associated downloads exist.
   * @param ctx - Provider context
   * @param taskId - Task ID
   * @returns Deletion result
   */
  deleteTask(ctx: ProviderContext, taskId: string): Promise<DeleteTaskResult | TaskErrorResult>;

  /**
   * Execute a task. Main download logic.
   * @param ctx - Provider context with config
   * @returns Execution result with stats
   */
  executeTask(ctx: ProviderContext): Promise<ExecuteTaskResult>;

  /**
   * Called when task config is updated by the user.
   * Implement if provider needs to react to config changes (e.g., re-validate cookies).
   * Server saves config to database AFTER this returns success.
   * @param ctx - Provider context with new config
   * @param taskId - Task ID
   * @returns Success or error — error prevents config from being saved
   */
  onTaskConfigUpdate(ctx: ProviderContext, taskId: string): Promise<DeleteTaskResult | TaskErrorResult>;
}

// ─── Provider Definition ───

/**
 * Provider factory function type.
 * Each provider package must export a default function of this type.
 *
 * @example
 * ```typescript
 * const createMyProvider: ProviderDefinition = () => new MyProvider();
 * export default createMyProvider;
 * ```
 */
export type ProviderDefinition = () => VaultProvider;

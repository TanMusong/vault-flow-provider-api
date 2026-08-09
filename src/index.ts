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
 * Task run state.
 */
export enum RunState {
  /** Idle, waiting for next schedule */
  Idle = 0,
  /** Currently running */
  Running = 1,
  /** Waiting to run (queued) */
  Waiting = 2,
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

/**
 * Log level.
 */
export enum LogLevel {
  /** Informational message */
  Info = 'info',
  /** Warning message */
  Warn = 'warn',
  /** Error message */
  Error = 'error',
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

// ─── Manifest ───

/**
 * Provider manifest structure (manifest.json).
 * Each provider must include this file in its project root.
 */
export interface ProviderManifest {
  /** Unique provider identifier */
  id: string;
  /** Provider display name, supports multi-language */
  name: LocalizedString;
  /** Provider description, supports multi-language */
  description: LocalizedString;
  /** Associated media platform name, supports multi-language */
  site: LocalizedString;
  /** Path to icon file relative to provider root (e.g., "assets/icon.webp") */
  icon: string;
  /** Version check URL(s) for update checking. Can be a single URL or URL array */
  version?: string | string[];
  /** Provider config schema (used for UI rendering) */
  config?: unknown[];
}

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
 * Provides localStorage-like key-value storage, isolated per provider.
 * Data is stored in JSON files on disk.
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

// ─── Task (display-only, managed by server) ───

/**
 * Task information, display-only, managed by server.
 */
export interface Task {
  /** Unique task identifier */
  id: string;
  /** Task display name */
  name: string;
  /** Associated provider identifier */
  site: string;
  /** Whether task is paused */
  paused: boolean;
  /** Execution interval in seconds */
  interval: number;
  /** Next execution time (ISO timestamp) */
  next_run: string | null;
  /** Last execution result state */
  last_state: TaskState;
  /** Current run state */
  run_state: RunState;
  /** Total downloaded size in bytes */
  totalSize: number;
  /** Download count */
  downloadCount?: number;
}

// ─── Task Result ───

/**
 * Task execution result.
 */
export interface TaskResult {
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

// ─── Provider Result Types ───

/**
 * Provider operation success result.
 */
export interface ProviderSuccessResult {
  /** Operation succeeded */
  success: true;
}

/**
 * Provider operation failure result.
 */
export interface ProviderErrorResult {
  /** Operation failed */
  success: false;
  /** Error message */
  message: string;
}

/** Provider operation result (success or failure) */
export type ProviderResult = ProviderSuccessResult | ProviderErrorResult;

// ─── Add Task Params ───

/**
 * Parameters for adding a task.
 */
export interface AddTaskParams {
  /** Execution interval in seconds */
  interval?: number;
  /** Other provider-specific parameters */
  [key: string]: unknown;
}

/**
 * Result of successfully adding a task.
 */
export interface AddTaskResult {
  /** Operation succeeded */
  success: true;
  /** Task display name (typically username) */
  name: string;
  /** User ID on the platform */
  userId: string;
  /** Execution interval in seconds */
  interval: number;
  /** Other provider-specific data */
  [key: string]: unknown;
}

/** Response from adding a task (success or failure) */
export type AddTaskResponse = AddTaskResult | ProviderErrorResult;

// ─── Provider Context ───

/**
 * Provider context passed during task execution.
 * Contains all necessary utilities and state.
 */
export interface ProviderContext {
  /** Current task ID */
  taskId: string;
  /** Persistent storage interface */
  storage: ProviderStorage;
  /** Provider installation directory path */
  providerDir: string;
  /** Provider config directory path */
  configDir: string;
  /** Current app locale (e.g. "zh-CN", "en-US") */
  locale: string;
  /** App version */
  version: string;

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
   * Add a task. Validates parameters (e.g., checks cookies),
   * returns task parameters or failure information.
   * @param ctx - Provider context
   * @param params - Task parameters
   * @returns Task addition result
   */
  addTask(ctx: ProviderContext, params: AddTaskParams): Promise<AddTaskResponse>;

  /**
   * Delete a task. Checks if deletion is possible, cleans up related files.
   * @param ctx - Provider context
   * @param taskId - Task ID
   * @returns Deletion result
   */
  deleteTask(ctx: ProviderContext, taskId: string): Promise<ProviderResult>;

  /**
   * Execute a task. This is the main entry point for provider execution.
   * @param ctx - Provider context
   * @returns Task execution result
   */
  executeTask(ctx: ProviderContext): Promise<TaskResult>;
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

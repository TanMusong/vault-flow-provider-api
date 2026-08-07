# @vault-flow/provider-api

TypeScript type definitions for Vault Flow media provider development.

## Overview

This package defines the contract between the Vault Flow core and media providers. Providers implement the `VaultProvider` interface to handle media downloads from specific platforms (e.g., Douyin, X/Twitter, Instagram).

## Installation

```bash
npm install @vault-flow/provider-api
# or
pnpm add @vault-flow/provider-api
```

## Quick Start

```typescript
import type {
  VaultProvider,
  ProviderContext,
  ProviderDefinition,
  TaskResult,
  AddTaskParams,
  AddTaskResponse,
  ProviderResult,
} from '@vault-flow/provider-api';
import { TaskState, DownloadStatus } from '@vault-flow/provider-api';

class MyProvider implements VaultProvider {
  async addTask(ctx: ProviderContext, params: AddTaskParams): Promise<AddTaskResponse> {
    const cookies = params.cookies as string;
    if (!cookies) {
      return { success: false, message: 'Cookies are required' };
    }
    ctx.storage.set('cookies', cookies);

    return {
      success: true,
      name: 'username',
      userId: '12345',
      interval: (params.interval as number) || 1800,
    };
  }

  async deleteTask(ctx: ProviderContext, taskId: string): Promise<ProviderResult> {
    if (ctx.hasPostDownloadRecord(taskId)) {
      return { success: false, message: 'Task has downloads' };
    }
    ctx.storage.clear();
    return { success: true };
  }

  async executeTask(ctx: ProviderContext): Promise<TaskResult> {
    const startTime = Date.now();
    return {
      state: TaskState.Success,
      message: 'ok',
      downloaded: 0,
      failed: 0,
      total: 0,
      duration: Date.now() - startTime,
    };
  }
}

const createMyProvider: ProviderDefinition = () => new MyProvider();
export default createMyProvider;
```

## Provider Structure

```
vault-flow-provider-my-platform/
├── package.json
├── tsconfig.json
├── manifest.json
├── assets/
│   └── icon.webp
└── src/
    └── index.ts
```

### package.json

```json
{
  "name": "@vault-flow/provider-my-platform",
  "version": "1.0.0",
  "main": "./dist/index.js",
}
```

### manifest.json

The manifest file is required and must be placed in the provider's project root.

```json
{
  "id": "my-platform",
  "name": {
    "zh-CN": "我的平台",
    "en-US": "My Platform"
  },
  "description": {
    "zh-CN": "下载我的平台的内容",
    "en-US": "Download content from My Platform"
  },
  "site": {
    "zh-CN": "我的平台",
    "en-US": "My Platform"
  },
  "icon": "assets/icon.webp",
  "version": "https://example.com/version.json",
  "config": [
    {
      "key": "setting1",
      "name": { "zh-CN": "设置项", "en-US": "Setting" },
      "type": "text",
      "placeholder": { "zh-CN": "请输入", "en-US": "Enter value" }
    }
  ]
}
```

#### Manifest Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Unique provider identifier |
| `name` | `LocalizedString` | Yes | Provider display name, supports multi-language |
| `description` | `LocalizedString` | Yes | Provider description, supports multi-language |
| `site` | `LocalizedString` | Yes | Media platform name, supports multi-language |
| `icon` | `string` | Yes | Path to icon file relative to provider root |
| `version` | `string \| string[]` | No | Version check URL(s) for update checking |
| `config` | `unknown[]` | No | Config schema for UI rendering |

### Default Export

Each provider must export a default factory function of type `ProviderDefinition`:

```typescript
const createMyProvider: ProviderDefinition = () => new MyProvider();
export default createMyProvider;
```

## Enums

### TaskState

| Value | Description |
|-------|-------------|
| `Error = 0` | Task execution failed |
| `Success = 1` | Task completed successfully |
| `LoginExpired = 2` | Login session expired |

### RunState

| Value | Description |
|-------|-------------|
| `Idle = 0` | Idle, waiting for next schedule |
| `Running = 1` | Currently running |
| `Waiting = 2` | Waiting to run (queued) |

### DownloadStatus

| Value | Description |
|-------|-------------|
| `Success = 1` | Download completed |
| `Failed = 2` | Download failed |
| `Downloading = 3` | Download in progress |

### MediaType

| Value | Description |
|-------|-------------|
| `Video = 'video'` | Video file |
| `Image = 'image'` | Image file |
| `Text = 'text'` | Text content |

### FileStatus

| Value | Description |
|-------|-------------|
| `Downloading = 'downloading'` | Download in progress |
| `Success = 'success'` | Download completed |
| `Failed = 'failed'` | Download failed |

### LogLevel

| Value | Description |
|-------|-------------|
| `Info = 'info'` | Informational message |
| `Warn = 'warn'` | Warning message |
| `Error = 'error'` | Error message |

## Core Interfaces

### VaultProvider

| Method | Description |
|--------|-------------|
| `addTask(ctx, params)` | Add a task, validate parameters |
| `deleteTask(ctx, taskId)` | Delete a task, clean up files |
| `executeTask(ctx)` | Execute the download task |

### ProviderContext

| Property/Method | Description |
|-----------------|-------------|
| `taskId` | Current task ID |
| `storage` | Persistent storage interface |
| `providerDir` | Provider installation directory |
| `configDir` | Provider config directory |
| `addDownloadRecord(data)` | Add a download record |
| `updateDownloadRecord(id, data)` | Update a download record |
| `emitDownloadProgress(id, files)` | Emit download progress event |
| `emitTaskProgress(processed, total)` | Emit task progress event |
| `hasSuccessfulDownloadRecord(id)` | Check if already downloaded |
| `hasPostDownloadRecord(id)` | Check if download exists |
| `addLog(level, msg)` | Add a log entry |
| `fs` | File system utilities |
| `path` | Path utilities |

### ProviderStorage

| Method | Description |
|--------|-------------|
| `get<T>(key)` | Get value |
| `set<T>(key, value)` | Set value |
| `remove(key)` | Remove value |
| `keys()` | Get all keys |
| `clear()` | Clear all data |

## Types Reference

### Task

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique task identifier |
| `name` | `string` | Task display name |
| `site` | `string` | Provider identifier |
| `paused` | `boolean` | Whether task is paused |
| `interval` | `number` | Execution interval (seconds) |
| `next_run` | `string \| null` | Next execution time |
| `last_state` | `TaskState` | Last execution result |
| `run_state` | `RunState` | Current run state |
| `totalSize` | `number` | Total downloaded size |

### TaskResult

| Field | Type | Description |
|-------|------|-------------|
| `state` | `TaskState` | Execution result state |
| `message` | `string` | Result message |
| `downloaded` | `number` | Successful downloads |
| `failed` | `number` | Failed downloads |
| `total` | `number` | Total items processed |
| `duration` | `number` | Execution time (ms) |

### DownloadFile

| Field | Type | Description |
|-------|------|-------------|
| `type` | `MediaType` | File type |
| `filename` | `string` | Filename |
| `url` | `string` | Source URL |
| `fileSize` | `number` | Current size (bytes) |
| `fileExpectedSize` | `number` | Expected size (bytes) |
| `fileStatus` | `FileStatus` | File status |

### DownloadData

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Content identifier |
| `author` | `string` | Author name |
| `authorId` | `string` | Author ID |
| `desc` | `string` | Content description |
| `state` | `DownloadStatus` | Download status |
| `stateMessage` | `string` | Status message |
| `files` | `DownloadFile[]` | File list |
| `dataJson` | `Record<string, unknown>` | Additional metadata |

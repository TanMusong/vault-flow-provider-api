# @vault-flow/provider-api

TypeScript type definitions for [Vault Flow](https://github.com/TanMusong/vault-flow) media provider development.

## Overview

This package defines the contract between the Vault Flow core and media providers. Providers implement the `VaultProvider` interface to handle media downloads from specific platforms (e.g., Douyin, X/Twitter, Instagram).

## Installation

```bash
npm install @vault-flow/provider-api
```

## Quick Start

```typescript
import type {
  VaultProvider,
  ProviderContext,
  ProviderDefinition,
  AddTaskResult,
  DeleteTaskResult,
  ExecuteTaskResult,
  TaskErrorResult,
} from '@vault-flow/provider-api';
import { TaskState, DownloadStatus } from '@vault-flow/provider-api';

class MyProvider implements VaultProvider {
  async addTask(ctx: ProviderContext): Promise<AddTaskResult | TaskErrorResult> {
    const cookies = ctx.config.cookies as string;
    if (!cookies) {
      return { success: false, message: 'Cookies are required' };
    }
    return { success: true, name: 'username' };
  }

  async deleteTask(ctx: ProviderContext, taskId: string): Promise<DeleteTaskResult | TaskErrorResult> {
    return { success: true };
  }

  async executeTask(ctx: ProviderContext): Promise<ExecuteTaskResult> {
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

  async onTaskConfigUpdate(ctx: ProviderContext, taskId: string): Promise<DeleteTaskResult | TaskErrorResult> {
    return { success: true };
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
  "dependencies": {
    "@vault-flow/provider-api": "^1.0.0"
  }
}
```

### manifest.json

The manifest file is required and must be placed in the provider's project root. It defines metadata and config schema for UI rendering.

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
      "key": "cookies",
      "name": { "zh-CN": "Cookie", "en-US": "Cookie" },
      "type": "textarea",
      "placeholder": { "zh-CN": "请粘贴 Cookie", "en-US": "Paste your cookies" }
    },
    {
      "key": "proxyEnabled",
      "name": { "zh-CN": "代理", "en-US": "Proxy" },
      "type": "checkbox",
      "default": false,
      "on": [
        {
          "key": "proxyType",
          "name": { "zh-CN": "代理类型", "en-US": "Proxy Type" },
          "type": "select",
          "default": "socks5",
          "values": [
            { "key": "socks5", "name": { "zh-CN": "SOCKS5", "en-US": "SOCKS5" } },
            { "key": "http", "name": { "zh-CN": "HTTP", "en-US": "HTTP" } }
          ]
        },
        {
          "key": "proxyHost",
          "name": { "zh-CN": "代理地址", "en-US": "Proxy Host" },
          "type": "text",
          "default": "127.0.0.1"
        },
        {
          "key": "proxyPort",
          "name": { "zh-CN": "代理端口", "en-US": "Proxy Port" },
          "type": "number",
          "default": 7890
        }
      ]
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
| `config` | `unknown[]` | No | Config schema for UI rendering. Config values are stored in the database by the server, not by the provider |

#### Config Schema Types

| Type | Description | Extra Fields |
|------|-------------|--------------|
| `text` | Single-line text input | `default`, `placeholder` |
| `textarea` | Multi-line text input | `default`, `placeholder` |
| `number` | Number input | `default` |
| `checkbox` | Toggle switch | `default`, `on: ConfigItem[]`, `off: ConfigItem[]` |
| `select` | Dropdown select | `default`, `values: { key: string, name: LocalizedString }[]` |

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

## Core Interfaces

### VaultProvider

| Method | Description | Return Type |
|--------|-------------|-------------|
| `addTask(ctx)` | Validate task creation (cookies/credentials) | `AddTaskResult \| TaskErrorResult` |
| `deleteTask(ctx, taskId)` | Clean up on task deletion | `DeleteTaskResult \| TaskErrorResult` |
| `executeTask(ctx)` | Execute the download task | `ExecuteTaskResult` |
| `onTaskConfigUpdate(ctx, taskId)` | React to config changes from user | `DeleteTaskResult \| TaskErrorResult` |

### ProviderContext

| Property/Method | Description |
|-----------------|-------------|
| `taskId` | Current task ID |
| `config` | Task configuration from database (cookies, downloadPath, etc.) |
| `storage` | Persistent storage for provider-internal data (cursors, caches) |
| `downloadDir` | Global download directory path |
| `locale` | Current app locale (e.g. "zh-CN") for localized messages |
| `version` | App version |
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

Storage is scoped to the current task and intended for provider-internal data (cursors, caches). Task config is managed by the server via `ctx.config`.

| Method | Description |
|--------|-------------|
| `get<T>(key)` | Get value |
| `set<T>(key, value)` | Set value |
| `remove(key)` | Remove value |
| `keys()` | Get all keys |
| `clear()` | Clear all data |

## Types Reference

### AddTaskResult

| Field | Type | Description |
|-------|------|-------------|
| `success` | `true` | Operation succeeded |
| `name` | `string` | Task display name (typically username) |

### DeleteTaskResult

| Field | Type | Description |
|-------|------|-------------|
| `success` | `true` | Operation succeeded |

### ExecuteTaskResult

| Field | Type | Description |
|-------|------|-------------|
| `state` | `TaskState` | Execution result state |
| `message` | `string` | Result message |
| `downloaded` | `number` | Successful downloads |
| `failed` | `number` | Failed downloads |
| `total` | `number` | Total items processed |
| `duration` | `number` | Execution time (ms) |

### TaskErrorResult

| Field | Type | Description |
|-------|------|-------------|
| `success` | `false` | Operation failed |
| `message` | `string` | Error message |

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

### TaskConfig

| Field | Type | Description |
|-------|------|-------------|
| `[key: string]` | `unknown` | Any user-configured parameter (cookies, downloadPath, etc.) |

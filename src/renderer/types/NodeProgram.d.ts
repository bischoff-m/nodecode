/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript during the build
 * process (.vite/prebuild.mjs). DO NOT MODIFY IT BY HAND. Instead, modify the source
 * JSONSchema file, and run json-schema-to-typescript to regenerate this file.
 */

export type NodeProgramSchema = NodeProgram
export type ListFieldState = string[]
export type MultiSelectFieldState = string[]

export interface NodeProgram {
  nodes: {
    [k: string]: NodeInstance
  }
  connections: {
    [k: string]: Connection
  }
  /**
   * This should point to the file NodeProgram.schema.json.
   */
  $schema?: string
}
export interface NodeInstance {
  type: string
  display: {
    width: number
    x: number
    y: number
  }
  state: NodeState
}
export interface NodeState {
  [k: string]: {
    [k: string]: InputOutputFieldState | ListFieldState | MultiSelectFieldState | string
  }
}
export interface InputOutputFieldState {}
export interface Connection {
  source: Socket
  target: Socket
}
export interface Socket {
  nodeKey: string
  fieldKey: string
  isInput: boolean
  socketKey: string
}

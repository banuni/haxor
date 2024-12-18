/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as PlayerImport } from './routes/player'
import { Route as MasterImport } from './routes/master'
import { Route as IndexImport } from './routes/index'

// Create/Update Routes

const PlayerRoute = PlayerImport.update({
  id: '/player',
  path: '/player',
  getParentRoute: () => rootRoute,
} as any)

const MasterRoute = MasterImport.update({
  id: '/master',
  path: '/master',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/master': {
      id: '/master'
      path: '/master'
      fullPath: '/master'
      preLoaderRoute: typeof MasterImport
      parentRoute: typeof rootRoute
    }
    '/player': {
      id: '/player'
      path: '/player'
      fullPath: '/player'
      preLoaderRoute: typeof PlayerImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/master': typeof MasterRoute
  '/player': typeof PlayerRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/master': typeof MasterRoute
  '/player': typeof PlayerRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/master': typeof MasterRoute
  '/player': typeof PlayerRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '/master' | '/player'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/master' | '/player'
  id: '__root__' | '/' | '/master' | '/player'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  MasterRoute: typeof MasterRoute
  PlayerRoute: typeof PlayerRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  MasterRoute: MasterRoute,
  PlayerRoute: PlayerRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/master",
        "/player"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/master": {
      "filePath": "master.tsx"
    },
    "/player": {
      "filePath": "player.tsx"
    }
  }
}
ROUTE_MANIFEST_END */

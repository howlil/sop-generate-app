import type { PortConstraint } from './orthogonalRouter'

export type RouteSide = 'top' | 'bottom' | 'left' | 'right'

export interface RouteCandidate {
  sSide: RouteSide
  eSide: RouteSide
  sourcePort?: PortConstraint
  targetPort?: PortConstraint
  jettySize?: number
  sourceJettySize?: number
  targetJettySize?: number
  preferSimple?: boolean
}

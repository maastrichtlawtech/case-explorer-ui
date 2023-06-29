import React from 'react'

/* This many contexts is probably very "anti-React", but perfect-graph expects
 * all sorts of components passed in statically and this inversion of control
 * makes it hard to interact with the program stat we need.
 *
 * The below shared contexts lets us work around the inversion of control from
 * perfect-graph by communicating state to children without having to pass them
 * as properties to perfect-graph.
 *
 * Using properties is inconvenient/impractical, as a lot of the state we need
 * access is create using state returned from the main 'useController' entry
 * point of perfect graph.
 */
export const FullGraphContext = React.createContext<any>(null)
export const ControllerContext = React.createContext<any>(null)
export const UIStateContext = React.createContext<any>(null)

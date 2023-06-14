import React from 'react'

/* Shared context to access the perfect-graph controller from child components
 * that cannot have it passed as property to the component, i.e. the DataBar is
 * passed as argument to the function that returns the controller and thus
 * cannot recieve it as property.
 */
export const ControllerContext = React.createContext<any>(null)

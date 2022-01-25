import React from 'react'
import * as R from 'colay/ramda'

export const useMemoizedEffect = (effect: () => (() => void), deps = []) => { 
  const depsRef = React.useRef(null)
  const effectCleanRef = React.useRef(() => {})
  React.useEffect(() => {
    if (R.equals(depsRef.current, deps)) {
      return effectCleanRef.current
    }
    const clean = effect() ??  R.identity
    effectCleanRef.current = clean 
  }, deps)
}
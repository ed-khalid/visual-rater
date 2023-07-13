import { useLayoutEffect, useRef } from "react"






export const useNotOnFirstRender = (fn:Function, deps:Array<any>) => {
  const updateNumber = useRef(0)  

  useLayoutEffect(() => {
    if (updateNumber.current > 3) fn()
    else updateNumber.current  = updateNumber.current + 1  
  }, [deps])

} 
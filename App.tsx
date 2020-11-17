import React from 'react';
import GraphEditor from "./components/Graph";
import {Graph} from "perfect-graph";
import queryString from "unitx/query-string";




export default function MyGraph() {
 
  const [data, setData] = React.useState({
    nodes: [
         { id: '1', position: { x: 10, y: 300 } },
         { id: '2', position: { x: 300, y: 100 } },
         { id: '3', position: { x: 1100, y: 50 } }
       ],
    edges: [
         { id: '51', source: '1', target: '2' },
         { id: '101', source: '2', target: '3' }
       ],
  })
  return (
    <GraphEditor />
  )
 }

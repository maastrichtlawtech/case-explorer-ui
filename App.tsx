import React from 'react';
import { Graph } from "perfect-graph";

export default function MyGraph() {
  const [data, setData] = React.useState({
    nodes: [
         { id: 1, position: { x: 10, y: 300 } },
         { id: 2, position: { x: 300, y: 100 } },
         { id: 3, position: { x: 1100, y: 50 } }
       ],
    edges: [
         { id: 51, source: 1, target: 2 },
         { id: 101, source: 2, target: 3 }
       ]
  })
  return (
    <Graph
 style={{ width: '100%', height: 600 }}
 nodes={
   [
   {
     id: 1,
     position: { x: 10, y: 300 },
     data: [
       {
         key: 'name',
         type: 'string',
         value: 'Maastricht'
       },
       {
         key: 'image',
         type: 'string',
         value: 'https://images.pexels.com/photos/105599/pexels-photo-105599.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500'
       },
       {
         key: 'story',
         type: 'string',
         value: `Maastricht, a university city on the southern tip of the Netherlands.`
       },
     ]
   },
   {
     id: 2,
     position: { x: 600, y: 10 },
     data: [
       {
         key: 'name',
         type: 'string',
         value: 'Amsterdam'
       },
       {
         key: 'image',
         type: 'string',
         value: 'https://images.pexels.com/photos/2031706/pexels-photo-2031706.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500'
       },
       {
         key: 'story',
         type: 'string',
         value: `Amsterdam is the Netherlands’ capital, known for its artistic heritage.`
       },
     ]
   },
   {
    id: 3,
    position: { x: 1100, y: 50 },
    data: [
      {
        key: 'name',
        type: 'string',
        value: 'Nijmegen'
      },
      {
        key: 'image',
        type: 'string',
        value: 'https://images.pexels.com/photos/2031706/pexels-photo-2031706.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500'
      },
      {
        key: 'story',
        type: 'string',
        value: `Nijmengen is the oldest city`
      },
    ]
  },
 ]
}
 edges={[
   { id: 51, source: 1, target: 2 }, { id: 101, source: 2, target: 3 }
 ]}
 renderNode={({ item }) => (
   <Graph.ProfileTemplate
     item={item}
   />
)}
/>
  )
 }

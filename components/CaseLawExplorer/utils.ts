const NODE_SIZE_RANGE_MAP = {
  betweenness: [0, 10],
  betweenness_centrality: [0, 1],
  closeness: [0, 10],
  closeness_centrality: [0, 1],
  degree: [0, 20],
  degree_centrality: [0, 1],
  in_degree: [0, 10],
  in_degree_centrality: [0, 1],
  out_degree: [0, 10],
  out_degree_centrality: [0, 10],
  page_rank: [0, 1],
  rel_in_degree: [0, 1],
  community: [0, 10],
  year: [
    1969,
    2015
  ],
  authorities: [0, 1],
  hubs: [0, 1],
}

export const calculateNetworkStatisticsRange  = (networkStatistics: any): any => {
  const nodeSizeRangeMap = {
    betweenness: [0, 10],
    betweenness_centrality: [0, 1],
    closeness: [0, 10],
    closeness_centrality: [0, 1],
    degree: [0, 20],
    degree_centrality: [0, 1],
    in_degree: [0, 10],
    in_degree_centrality: [0, 1],
    out_degree: [0, 10],
    out_degree_centrality: [0, 10],
    page_rank: [0, 1],
    rel_in_degree: [0, 1],
    community: [0, 10],
    year: [
      1969,
      2015
    ],
    authorities: [0, 1],
    hubs: [0, 1],
  }
  const values = Object.values(networkStatistics);
  values.forEach((nodeStatistics) =>{
    Object.keys(NODE_SIZE_RANGE_MAP).forEach((key) => {
      const statisticValue = nodeStatistics[key];
      nodeSizeRangeMap[key][0] = Math.min(statisticValue, nodeSizeRangeMap[key][0]);
      nodeSizeRangeMap[key][1] = Math.max(statisticValue, nodeSizeRangeMap[key][1]);
    })
  })
  return nodeSizeRangeMap
}
# Case Law Explorer: UI

The Case Law Explorer UI is a tool for conducting network analysis on Dutch and European case law, directed at law students and legal researchers. It allows for searching and visualizing the network of case citations that depicts case law and facilitates insights such as the identifcation of landmark cases, or the detection of sub topics through clusters of case decisions.

This documentation covers materials for building a [network analysis software platform](https://dev.d11iy22xsphp3a.amplifyapp.com/) for analyzing Dutch and European court decisions (see repository [maastrichtlawtech/case-explorer-ui](https://github.com/maastrichtlawtech/case-explorer-ui)). The repository builds on the work by Dafne van Kuppevelt of the Netherlands e-Science Centre (see repository [NLeSC/case-law-app](https://github.com/NLeSC/case-law-app)).

The web application draws data from our data pipeline to extract, transform and load Dutch and European case law (see repository [maastrichtlawtech/case-law-explorer](https://github.com/maastrichtlawtech/case-law-explorer)).

<p align="center">
  <a href="https://github.com/maastrichtlawtech/case-explorer-ui/tree/dev">
    <img width="400" alt="case-explorer-ui repository"src="https://ondemand.bannerbear.com/signedurl/D0nJ4XLedwbENRZa1x/image.jpg?modifications=W3sibmFtZSI6InJlcG8iLCJ0ZXh0IjoibWFhc3RyaWNodGxhd3RlY2ggLyAqY2FzZS1leHBsb3Jlci11aSoifSx7Im5hbWUiOiJkZXNjIiwidGV4dCI6IlVzZXIgaW50ZXJmYWNlIGZvciB0aGUgbmV0d29yayBhbmFseXNpcyBzb2Z0d2FyZSBwbGF0Zm9ybSBmb3IgYW5hbHl6aW5nIER1dGNoIGFuZCBFdXJvcGVhbiBjb3VydCBkZWNpc2lvbnMuIn0seyJuYW1lIjoiYXZhdGFyNSIsImhpZGUiOnRydWV9LHsibmFtZSI6ImF2YXRhcjQiLCJoaWRlIjp0cnVlfSx7Im5hbWUiOiJhdmF0YXIzIiwiaGlkZSI6dHJ1ZX0seyJuYW1lIjoiYXZhdGFyMiIsImhpZGUiOnRydWV9LHsibmFtZSI6ImF2YXRhcjEiLCJpbWFnZV91cmwiOiJodHRwczovL2F2YXRhcnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3UvNTI0NTIxNzQ_dj00In0seyJuYW1lIjoiY29udHJpYnV0b3JzIiwidGV4dCI6Im1hYXN0cmljaHRsYXd0ZWNoIn0seyJuYW1lIjoic3RhcnMiLCJ0ZXh0IjoiMSJ9XQ&s=63623cdd33143e92e6c069caa3610262a98c2b9a8aef8f8ca79e77e58aab023c" />
  </a>
  <a href="https://github.com/maastrichtlawtech/case-law-explorer">
    <img width="400" alt="case-explorer-ui repository"src="https://ondemand.bannerbear.com/signedurl/D0nJ4XLedwbENRZa1x/image.jpg?modifications=W3sibmFtZSI6InJlcG8iLCJ0ZXh0IjoibWFhc3RyaWNodGxhd3RlY2ggLyAqY2FzZS1sYXctZXhwbG9yZXIqIn0seyJuYW1lIjoiZGVzYyIsInRleHQiOiJNYXRlcmlhbHMgZm9yIGJ1aWxkaW5nIGEgbmV0d29yayBhbmFseXNpcyBzb2Z0d2FyZSBwbGF0Zm9ybSBmb3IgYW5hbHl6aW5nIER1dGNoIGFuZCBFdXJvcGVhbiBjb3VydCBkZWNpc2lvbnMuIn0seyJuYW1lIjoiYXZhdGFyNSIsImltYWdlX3VybCI6Imh0dHBzOi8vYXZhdGFycy5naXRodWJ1c2VyY29udGVudC5jb20vdS8xMzU2OTAyOT92PTQifSx7Im5hbWUiOiJhdmF0YXI0IiwiaW1hZ2VfdXJsIjoiaHR0cHM6Ly9hdmF0YXJzLmdpdGh1YnVzZXJjb250ZW50LmNvbS91LzIzNTUyNDk5P3Y9NCJ9LHsibmFtZSI6ImF2YXRhcjMiLCJpbWFnZV91cmwiOiJodHRwczovL2F2YXRhcnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3UvMTIwNTQ5NjQ_dj00In0seyJuYW1lIjoiYXZhdGFyMiIsImltYWdlX3VybCI6Imh0dHBzOi8vYXZhdGFycy5naXRodWJ1c2VyY29udGVudC5jb20vdS8xNTE1OTEzNz92PTQifSx7Im5hbWUiOiJhdmF0YXIxIiwiaW1hZ2VfdXJsIjoiaHR0cHM6Ly9hdmF0YXJzLmdpdGh1YnVzZXJjb250ZW50LmNvbS91LzIyODk1Mjg0P3Y9NCJ9LHsibmFtZSI6ImNvbnRyaWJ1dG9ycyIsInRleHQiOiIxMiBDb250cmlidXRvcnMifSx7Im5hbWUiOiJzdGFycyIsInRleHQiOiI0In1d&s=4d11348fcdb6618b59835346f9816cf5e36511d9cace30a12e19f408952bec2e" />
  </a>
</p>

SETUP:

- install and configure the [amplify cli](https://docs.amplify.aws/cli/start/install/)
- amplify add api:
  - add GraphQL schema to define table and queries
    after first pushing GraphQL table schema:
  - manually re-create global secondary indexes in AWS DynamoDB console and only project strictly necessary attributes to minimize storage/query costs
  - run Elasticsearch re-indexing script to use correct field mapping
- amplify add function
- amplify add auth

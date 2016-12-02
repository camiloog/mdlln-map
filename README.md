Medellín interactive Map
========================

A focused, minimum viable product for an interactive map to display relevant information of Medellín city.

Set development environment
---------------------------

1. Install the following dependencies if missing
    - Node.js, npm
    - bower
    - gulp

2. Clone the repository and change directory to it
```{r, engine='bash', count_lines}
  git clone git@gitlab.com:camiloog/mdlln-map-prj.git
  cd mdlln-map-prj
```

3. Install dependencies
```{r, engine='bash', count_lines}
  npm install
  bower Install
```
4. Inject front end dependencies
```{r, engine='bash', count_lines}
  gulp wiredep
```

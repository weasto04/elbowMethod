// Minimal KMeans implementation and demo wiring.
(function(){
  // Utilities
  function rand(n){ return Math.random()*n }
  function randn_bm(){ // normal(0,1)
    let u=0,v=0; while(u===0) u=Math.random(); while(v===0) v=Math.random();
    return Math.sqrt(-2*Math.log(u)) * Math.cos(2*Math.PI*v);
  }

  // Data generators
  function generate(distribution, n){
    const pts = [];
    if(distribution==='uniform'){
      for(let i=0;i<n;i++) pts.push([rand(10)-5, rand(10)-5]);
    } else if(distribution==='normal'){
      for(let i=0;i<n;i++) pts.push([randn_bm()*2, randn_bm()*2]);
    } else if(distribution==='blobs'){
      const centers = [[-5,-3],[0,4],[4,-1]];
      for(let i=0;i<n;i++){
        const c = centers[i % centers.length];
        pts.push([c[0] + randn_bm()*0.8, c[1] + randn_bm()*0.8]);
      }
    } else { // random mix
      const types = ['uniform','normal','blobs'];
      return generate(types[Math.floor(Math.random()*types.length)], n);
    }
    return pts;
  }

  // KMeans (simple, no optimizations)
  function kmeans(points, k, maxIter=100){
    const n = points.length;
    if(k<=0) return {labels:[],centroids:[],inertia:0};
    // init centroids: random points
    const centroids = [];
    const used = new Set();
    while(centroids.length<k){
      const idx = Math.floor(Math.random()*n);
      if(!used.has(idx)){ used.add(idx); centroids.push(points[idx].slice()); }
    }
    const labels = new Array(n).fill(-1);
    for(let it=0; it<maxIter; it++){
      let moved = false;
      // assign
      for(let i=0;i<n;i++){
        const p = points[i];
        let best=0,bdist=Infinity;
        for(let j=0;j<k;j++){
          const c=centroids[j];
          const dx=p[0]-c[0], dy=p[1]-c[1];
          const d=dx*dx+dy*dy;
          if(d<bdist){bdist=d;best=j}
        }
        if(labels[i]!==best){ moved = true; labels[i]=best }
      }
      // update
      const sums = Array.from({length:k}, ()=>[0,0,0]); // xsum, ysum, count
      for(let i=0;i<n;i++){
        const l = labels[i]; sums[l][0]+=points[i][0]; sums[l][1]+=points[i][1]; sums[l][2]++;
      }
      for(let j=0;j<k;j++){
        if(sums[j][2]===0) continue; // leave centroid
        const nx = sums[j][0]/sums[j][2], ny = sums[j][1]/sums[j][2];
        if(nx!==centroids[j][0] || ny!==centroids[j][1]){ centroids[j][0]=nx; centroids[j][1]=ny; }
      }
      if(!moved) break;
    }
    // inertia
    let inertia=0;
    for(let i=0;i<n;i++){
      const c = centroids[labels[i]];
      const dx=points[i][0]-c[0], dy=points[i][1]-c[1]; inertia += dx*dx+dy*dy;
    }
    return {labels,centroids,inertia};
  }

  // Plot helpers
  const leftDiv = document.getElementById('leftPlot');
  const rightDiv = document.getElementById('rightPlot');

  let state = {points:[],maxk:10,dist:'random',n:300,results:{}};

  function drawLeft(points, labels, centroids){
    if(!labels){ // show raw
      const trace = {x: points.map(p=>p[0]), y: points.map(p=>p[1]), mode:'markers', type:'scatter', marker:{size:6,color:'#444'}};
      Plotly.newPlot(leftDiv, [trace], {margin:{l:30,r:10,t:20,b:30},hovermode:'closest'});
      return;
    }
    // colored clusters
    const k = Math.max(...labels)+1;
    const traces = [];
    for(let j=0;j<k;j++){
      const xs=[], ys=[];
      for(let i=0;i<points.length;i++) if(labels[i]===j){ xs.push(points[i][0]); ys.push(points[i][1]); }
      traces.push({x:xs,y:ys,mode:'markers',type:'scatter',name:'cluster '+j,marker:{size:6}});
    }
    // centroids
    traces.push({x:centroids.map(c=>c[0]), y:centroids.map(c=>c[1]), mode:'markers', type:'scatter', name:'centroids', marker:{size:12,symbol:'x',color:'#000'}});
    Plotly.newPlot(leftDiv, traces, {margin:{l:30,r:10,t:20,b:30},hovermode:'closest'});
  }

  function drawElbow(results){
    const ks = Object.keys(results).map(k=>parseInt(k)).sort((a,b)=>a-b);
    const inertias = ks.map(k=>results[k].inertia);
    const trace = {x:ks, y:inertias, mode:'lines+markers', type:'scatter', marker:{size:8}, hovertemplate:'k=%{x}<br>inertia=%{y:.2f}<extra></extra>'};
    Plotly.newPlot(rightDiv, [trace], {margin:{l:40,r:10,t:20,b:40}, xaxis:{title:'k'}, yaxis:{title:'inertia'}});

    rightDiv.on('plotly_click', function(data){
      const k = data.points[0].x;
      const res = results[k];
      if(res) drawLeft(state.points, res.labels, res.centroids);
    });
  }

  function computeElbow(points, maxk){
    const results = {};
    for(let k=1;k<=maxk;k++){
      const r = kmeans(points,k);
      results[k]=r;
    }
    return results;
  }

  // wire up controls
  const regenBtn = document.getElementById('regen');
  const distSel = document.getElementById('dist');
  const nInput = document.getElementById('n');
  const maxkInput = document.getElementById('maxk');

  function regen(){
    state.n = parseInt(nInput.value)||300;
    state.dist = distSel.value;
    state.maxk = Math.max(2, Math.min(50, parseInt(maxkInput.value)||10));
    state.points = generate(state.dist, state.n);
    // quick compute elbow (k from 1..maxk)
    state.results = computeElbow(state.points, state.maxk);
    drawLeft(state.points);
    drawElbow(state.results);
  }

  regenBtn.addEventListener('click', regen);
  distSel.addEventListener('change', regen);
  nInput.addEventListener('change', regen);
  maxkInput.addEventListener('change', regen);

  // initial render
  regen();

})();

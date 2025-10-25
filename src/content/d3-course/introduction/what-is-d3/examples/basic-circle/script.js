d3.select("#canvas")
  .append("circle")
  .attr("cx", 200)
  .attr("cy", 200)
  .attr("r", 50)
  .attr("fill", "steelblue");

// === CONTROLS ===
window.addEventListener("playgroundControlChange", (e) => {
  const { controlId, value } = e.detail;

  if (controlId === "radius") {
    d3.select("circle").attr("r", value);
  } else if (controlId === "color") {
    d3.select("circle").attr("fill", value);
  }
});

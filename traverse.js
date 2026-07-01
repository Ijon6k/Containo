const fs = require('fs');
const graph = JSON.parse(fs.readFileSync('./graphify-out/graph.json', 'utf-8'));

// Find node for useContainerActions
const targetName = 'useContainerActions';
let targetNodes = graph.nodes.filter(n => n.label === targetName || n.id.includes(targetName));

console.log('Found target nodes:', targetNodes.map(n => n.id));

const visited = new Set();
const dependents = new Set();

function traverseBackward(nodeId) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    
    const node = graph.nodes.find(n => n.id === nodeId);
    if (node && node.sourceFile && node.sourceFile.startsWith('components/')) {
        dependents.add(node.sourceFile);
    }
    
    // Find edges where target is nodeId (meaning someone depends on this node)
    // Dependencies are usually represented as: A imports B (source A, target B)
    // So backward traversal means finding edges where target is nodeId
    const incomingEdges = graph.edges.filter(e => e.target === nodeId);
    for (const edge of incomingEdges) {
        traverseBackward(edge.source);
    }
}

targetNodes.forEach(n => traverseBackward(n.id));

console.log('\nComponents depending on', targetName, ':');
console.log(Array.from(dependents).join('\n'));

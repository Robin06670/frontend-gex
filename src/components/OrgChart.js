import React, { useEffect, useCallback, useMemo, useState } from "react";
import ReactFlow, {
  Controls,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  useReactFlow
} from "reactflow";
import "reactflow/dist/style.css";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrashAlt } from "react-icons/fa";

const CustomNode = ({ data }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/collaborateurs/${data.id}/clients`);
  };

  return (
    <div 
      className="bg-white shadow-md rounded-lg p-3 flex flex-col items-center border border-gray-300 w-44 relative cursor-pointer"
      onClick={handleClick} 
    >
      <div className="absolute top-2 right-2 flex flex-col space-y-2">
        <button 
          onClick={(e) => { e.stopPropagation(); data.onEdit(); }} 
          className="text-blue-500 hover:text-blue-700 p-1"
        >
          <FaEdit size={16} />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); data.onDelete(); }} 
          className="text-red-500 hover:text-red-700 p-1"
        >
          <FaTrashAlt size={16} />
        </button>
      </div>
      <img src={data.avatar} alt="Avatar" className="w-16 h-16 rounded-full shadow-md mb-2" />
      <div className="text-center">
        <p className="font-bold text-sm">{data.name}</p>
        <p className="text-xs text-gray-600">{data.role}</p>
      </div>
      <Handle type="target" position={Position.Top} className="w-2 h-2 bg-blue-500" />
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-blue-500" />
    </div>
  );
};

const IntermediateNode = () => {
  return (
    <div className="w-4 h-4 bg-gray-700 rounded-full shadow-md border border-gray-900">
      <Handle type="target" position={Position.Top} className="w-2 h-2 bg-blue-500" />
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-blue-500" />
    </div>
  );
};

export default function OrgChartWrapper() {
  return (
    <ReactFlowProvider>
      <OrgChart />
    </ReactFlowProvider>
  );
}

function OrgChart() {
  const navigate = useNavigate();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);
  const { fitView } = useReactFlow();
  const [positions, setPositions] = useState(JSON.parse(localStorage.getItem("orgchart_positions")) || {});

  const handleEdit = useCallback((id) => {
    navigate(`/collaborateurs/${id}`);
  }, [navigate]);

  const handleDelete = useCallback((id) => {
    const confirmDelete = window.confirm("Êtes-vous sûr de vouloir supprimer ce collaborateur ?");
    if (confirmDelete) {
      fetch(`${process.env.REACT_APP_API_BASE_URL}/collaborators/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}` // ✅ ajout auth ici aussi
        }
      })
      .then(() => loadNodes())
      .catch(err => console.error("Erreur suppression :", err));
    }
  }, []);

  const loadNodes = useCallback(() => {
    fetch(`${process.env.REACT_APP_API_BASE_URL}/collaborators`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}` // ✅ Ajout du token ici
      }
    })
      .then(res => res.json())
      .then(collaborators => {
        if (!Array.isArray(collaborators)) {
          console.error("⚠️ Réponse API non conforme : collaborators n’est pas un tableau.");
          return;
        }

        let formattedNodes = [];
        let formattedEdges = [];
        let yOffset = 50;
        let intermediateNodes = {};

        // 📌 Détection des subordonnés ayant plusieurs managers
        collaborators.forEach(collab => {
          if (Array.isArray(collab.managers) && collab.managers.length > 1) {
            const key = collab.managers.sort().join("-");
            if (!intermediateNodes[key]) {
              intermediateNodes[key] = {
                id: `inter-${key}`,
                position: positions[`inter-${key}`] || { x: 500, y: yOffset + 200 },
                data: {},
                type: "intermediate",
                draggable: true,
              };
            }
          }
        });

        formattedNodes.push(...Object.values(intermediateNodes));

        // 📌 Création des nœuds collaborateurs
        collaborators.forEach(collab => {
          formattedNodes.push({
            id: collab._id.toString(),
            position: positions[collab._id] || { x: 300, y: yOffset + 300 },
            data: {
              id: collab._id,
              name: `${collab.firstName} ${collab.lastName}`,
              role: collab.role,
              avatar: `${process.env.PUBLIC_URL}/images/${collab.gender === "Homme" ? "homme" : "femme"}.png`,
              onEdit: () => handleEdit(collab._id),
              onDelete: () => handleDelete(collab._id),
            },
            type: "custom",
            draggable: true,
          });
        });

        // 📌 Création des edges avec nœuds intermédiaires
        collaborators.forEach(collab => {
          if (Array.isArray(collab.managers) && collab.managers.length === 1) {
            formattedEdges.push({
              id: `e${collab.managers[0]}-${collab._id}`,
              source: collab.managers[0].toString(),
              target: collab._id.toString(),
              animated: true,
              style: { stroke: "#4b5563", strokeWidth: 2 },
            });
          } else if (Array.isArray(collab.managers) && collab.managers.length > 1) {
            const key = collab.managers.sort().join("-");
            const interNodeId = `inter-${key}`;

            Array.isArray(collab.managers) && collab.managers.forEach(managerId => {
              if (!formattedEdges.some(edge => edge.source === managerId.toString() && edge.target === interNodeId)) {
                formattedEdges.push({
                  id: `e${managerId}-${interNodeId}`,
                  source: managerId.toString(),
                  target: interNodeId,
                  animated: true,
                  style: { stroke: "#4b5563", strokeWidth: 2 },
                });
              }
            });

            formattedEdges.push({
              id: `e${interNodeId}-${collab._id}`,
              source: interNodeId,
              target: collab._id.toString(),
              animated: true,
              style: { stroke: "#4b5563", strokeWidth: 2 },
            });
          }
        });

        setNodes(formattedNodes);
        setEdges(formattedEdges);
      })
      .catch(err => console.error("Erreur API :", err));
  }, [positions, handleEdit, handleDelete]);

  const onNodeDragStop = (event, node) => {
    setPositions(prev => {
      const newPositions = { ...prev, [node.id]: node.position };
      localStorage.setItem("orgchart_positions", JSON.stringify(newPositions));
      return newPositions;
    });
  };

  useEffect(() => {
    loadNodes();
  }, [loadNodes]);

  const nodeTypes = useMemo(() => ({
    custom: CustomNode,
    intermediate: IntermediateNode,
  }), []);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onNodeDragStop={onNodeDragStop}
      fitView
    >
      <Controls />
    </ReactFlow>
  );
}

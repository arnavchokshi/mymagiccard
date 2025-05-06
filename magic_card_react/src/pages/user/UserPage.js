import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const PublicProfile = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await fetch(`http://192.168.86.40:2000/api/public/${id}`);
      const data = await res.json();
      setUser(data);
    };

    fetchProfile();
  }, [id]);

  if (!user) return <div>Loading public profile...</div>;

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h1>{user.name}</h1>
      <p>Email: {user.email}</p>

      <div style={{ marginTop: "2rem", textAlign: "left", maxWidth: "600px", marginInline: "auto" }}>
        {user.blocks && user.blocks.length > 0 ? (
          user.blocks.map((block, i) => (
            <div key={i} style={{ marginBottom: "1.5rem" }}>
              <h4>{block.type.toUpperCase()}</h4>
              {block.type === "link" ? (
                <a href={block.content} target="_blank" rel="noopener noreferrer">{block.content}</a>
              ) : block.type === "code" ? (
                <pre style={{ background: "#eee", padding: "1rem" }}>
                  <code>{block.content}</code>
                </pre>
              ) : (
                <p>{block.content}</p>
              )}
            </div>
          ))
        ) : (
          <p>No content yet.</p>
        )}
      </div>
    </div>
  );
};

export default PublicProfile;

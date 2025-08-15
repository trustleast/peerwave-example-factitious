import { FactDisplay } from "components/FactDisplay";
import React from "react";

export const App: React.FC = () => (
  <div className="full-height">
    <div className="content-padded center">
      <div className="box">
        <FactDisplay />
      </div>
    </div>
</div>
);

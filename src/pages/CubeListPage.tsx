import React, { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { hasOrganizerRole } from "@/utils/auth";
import { useEvents, useChapters } from "@/store/data.store";
import { useCurrentUser } from "@/store/auth.store";
import CubeCard from "@/components/CubeCard";
import CubeMap from "@/components/CubeMap";
import { PlusIcon, ListBulletIcon, MapIcon } from "@/icons";
import { CubeEvent } from "@/types";

type CubesView = "list" | "map";

const ViewToggleButton: React.FC<{
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
}> = ({ onClick, isActive, children }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-3 py-1.5 text-sm font-semibold border ${
      isActive
        ? "bg-black text-white border-black"
        : "bg-white text-black border-black hover:bg-neutral-100"
    } transition-colors duration-200`}
  >
    {children}
  </button>
);

const CubeListPage: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const allEvents = useEvents();
  const chapters = useChapters();
  const [view, setView] = useState<CubesView>("list");

  const upcomingEvents = useMemo(
    () =>
      allEvents
        .filter((e) => new Date(e.dateTime) >= new Date())
        .sort(
          (a, b) =>
            new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
        ),
    [allEvents]
  );

  const handleSelectCube = useCallback(
    (event: CubeEvent) => {
      navigate(`/cubes/${event.id}`);
    },
    [navigate]
  );

  const handleCreateCube = useCallback(() => {
    navigate("/cubes/create");
  }, [navigate]);

  return (
    <div className="py-8 md:py-12">
      <div className="mb-8 md:mb-12">
        <div className="w-full flex justify-center items-center relative mb-2">
          <h1 className="text-4xl md:text-5xl font-extrabold text-black tracking-tight">
            Upcoming Cubes
          </h1>
          {currentUser && hasOrganizerRole(currentUser) && (
            <button
              onClick={handleCreateCube}
              className="absolute right-0 flex items-center bg-primary text-white font-bold py-2 px-4 hover:bg-primary-hover transition-colors duration-300"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Create Cube
            </button>
          )}
        </div>
      </div>

      <div className="flex justify-end items-center mb-6">
        <div className="flex items-center space-x-0 border border-black">
          <ViewToggleButton
            onClick={() => setView("list")}
            isActive={view === "list"}
          >
            <ListBulletIcon className="w-5 h-5" />
            <span>List</span>
          </ViewToggleButton>
          <ViewToggleButton
            onClick={() => setView("map")}
            isActive={view === "map"}
          >
            <MapIcon className="w-5 h-5" />
            <span>Map</span>
          </ViewToggleButton>
        </div>
      </div>

      {view === "list" ? (
        <div className="grid gap-6 md:gap-8 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {upcomingEvents.map((event) => (
            <CubeCard
              key={event.id}
              event={event}
              onSelect={handleSelectCube}
            />
          ))}
        </div>
      ) : (
        <CubeMap
          events={upcomingEvents}
          onSelectCube={handleSelectCube}
          chapters={chapters}
        />
      )}
    </div>
  );
};

export default CubeListPage;

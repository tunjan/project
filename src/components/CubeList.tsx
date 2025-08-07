import React, { useState, useMemo } from "react";
import { type CubeEvent, type Chapter } from "@/types";
import CubeCard from "./CubeCard";
import CubeMap from "./CubeMap";
import { PlusIcon, ListBulletIcon, MapIcon } from "@/icons";
import { useCurrentUser } from "@/store/auth.store";
import { useEvents, useChapters } from "@/store/data.store";
import { hasOrganizerRole } from "@/utils/auth";

interface CubeListProps {
  onSelectCube: (event: CubeEvent) => void;
  onNavigate: (view: "createCube") => void;
}

type CubesView = "list" | "map";
type EventTimeView = "upcoming" | "past";

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

const CubeList: React.FC<CubeListProps> = ({ onSelectCube, onNavigate }) => {
  const currentUser = useCurrentUser();
  const events = useEvents();
  const chapters = useChapters();

  const [cubesView, setCubesView] = useState<CubesView>("list");
  const [eventTimeView, setEventTimeView] = useState<EventTimeView>("upcoming");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");

  const availableRegions = useMemo(
    () => [...new Set(chapters.map((c: Chapter) => c.country))],
    [chapters]
  );

  const eventsToDisplay = useMemo(
    () =>
      events
        .filter((e: CubeEvent) => {
          const isEventInPast = new Date(e.dateTime) < new Date();
          return eventTimeView === "past" ? isEventInPast : !isEventInPast;
        })
        .filter((e: CubeEvent) => {
          if (selectedRegion === "all") return true;
          const chapterOfEvent = chapters.find(
            (c: Chapter) => c.name === e.city
          );
          return chapterOfEvent?.country === selectedRegion;
        })
        .sort((a: CubeEvent, b: CubeEvent) =>
          eventTimeView === "past"
            ? new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
            : new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
        ),
    [events, chapters, eventTimeView, selectedRegion]
  );

  return (
    <div className="py-8 md:py-12">
      <div className="mb-8 md:mb-12">
        <div className="w-full flex justify-center items-center relative mb-2">
          <h1 className="text-4xl md:text-5xl font-extrabold text-black tracking-tight">
            {eventTimeView === "upcoming" ? "Upcoming" : "Past"} Cubes
          </h1>
          {currentUser && hasOrganizerRole(currentUser) && (
            <button
              onClick={() => onNavigate("createCube")}
              className="absolute right-0 flex items-center bg-primary text-white font-bold py-2 px-4 hover:bg-primary-hover transition-colors duration-300"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Create Cube
            </button>
          )}
        </div>
        <div className="w-full flex justify-center">
          <p className="max-w-2xl text-lg text-neutral-600 text-center">
            {eventTimeView === "upcoming"
              ? "Find an event near you and join the movement."
              : "A history of our actions. Organizers can select an event to log reports."}
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-0 border border-black">
            <ViewToggleButton
              onClick={() => setEventTimeView("upcoming")}
              isActive={eventTimeView === "upcoming"}
            >
              <span>Upcoming</span>
            </ViewToggleButton>
            <ViewToggleButton
              onClick={() => setEventTimeView("past")}
              isActive={eventTimeView === "past"}
            >
              <span>Past</span>
            </ViewToggleButton>
          </div>
          <div className="border border-black">
            <select
              id="region-filter"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full bg-white py-1.5 px-3 text-sm font-semibold text-black focus:ring-0"
              aria-label="Filter by region"
            >
              <option value="all">All Regions</option>
              {availableRegions.map((region: string) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center space-x-0 border border-black">
          <ViewToggleButton
            onClick={() => setCubesView("list")}
            isActive={cubesView === "list"}
          >
            <ListBulletIcon className="w-5 h-5" />
            <span>List</span>
          </ViewToggleButton>
          <ViewToggleButton
            onClick={() => setCubesView("map")}
            isActive={cubesView === "map"}
          >
            <MapIcon className="w-5 h-5" />
            <span>Map</span>
          </ViewToggleButton>
        </div>
      </div>

      {cubesView === "list" ? (
        <div className="grid gap-6 md:gap-8 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {eventsToDisplay.map((event: CubeEvent) => (
            <CubeCard key={event.id} event={event} onSelect={onSelectCube} />
          ))}
        </div>
      ) : (
        <CubeMap
          events={eventsToDisplay}
          onSelectCube={onSelectCube}
          chapters={chapters}
        />
      )}

      {eventsToDisplay.length === 0 && (
        <div className="text-center py-16 border border-black bg-white">
          <h3 className="text-xl font-bold">
            No {eventTimeView} events found for this region.
          </h3>
          <p className="text-neutral-500 mt-2">
            Check back later or change your filter selection.
          </p>
        </div>
      )}
    </div>
  );
};

export default CubeList;

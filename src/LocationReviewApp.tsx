import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Star, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import locationData from "./locations.json";

type LocationType = "country" | "cultural-region" | "state" | "city" | "neighborhood" | "district" | "place";
type Perspective = "general" | "family" | "business" | "adventure" | "cultural";

interface Review {
  id: string;
  perspective: Perspective;
  rating: number;
  comment: string;
  timestamp: string;
}

interface Location {
  id: string;
  name: string;
  type: LocationType;
  parentId?: string;
  reviews: Review[];
}

const PERSPECTIVES: Perspective[] = ["general", "family", "business", "adventure", "cultural"];
const LOCATION_TYPES: { value: LocationType; label: string }[] = [
  { value: "country", label: "Country" },
  { value: "cultural-region", label: "Cultural Region" },
  { value: "state", label: "State" },
  { value: "city", label: "City" },
  { value: "neighborhood", label: "Neighborhood" },
  { value: "district", label: "District" },
  { value: "place", label: "Place" },
];

interface LocationData {
  locations: Location[];
}

const LocationReviewApp = () => {
  const typedLocationData = locationData as LocationData;
  const [locations, setLocations] = useState<Location[]>(typedLocationData.locations);
  const [selectedPerspectives, setSelectedPerspectives] = useState<Set<Perspective>>(new Set(["general"]));
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [newLocation, setNewLocation] = useState({
    name: "",
    type: "country" as LocationType,
    parentId: undefined as string | undefined,
  });
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [currentLocationId, setCurrentLocationId] = useState<string | undefined>(undefined);

  const togglePerspective = (perspective: Perspective) => {
    const updated = new Set(selectedPerspectives);
    if (updated.has(perspective)) {
      updated.delete(perspective);
      if (updated.size === 0) updated.add("general");
    } else {
      updated.add(perspective);
    }
    setSelectedPerspectives(updated);
  };

  const getBreadcrumbs = (location: Location): Location[] => {
    const breadcrumbs: Location[] = [location];
    let currentParentId = location.parentId;

    while (currentParentId) {
      const parent = locations.find((loc) => loc.id === currentParentId);
      if (parent) {
        breadcrumbs.unshift(parent);
        currentParentId = parent.parentId;
      } else {
        break;
      }
    }

    return breadcrumbs;
  };

  const getAverageRating = (location: Location, perspectives: Set<Perspective>) => {
    const relevantReviews = location.reviews.filter((review) => perspectives.has(review.perspective as Perspective));
    if (relevantReviews.length === 0) return null;
    const sum = relevantReviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / relevantReviews.length).toFixed(1);
  };

  const addLocation = () => {
    const newLoc: Location = {
      id: Date.now().toString(),
      name: newLocation.name,
      type: newLocation.type,
      parentId: newLocation.parentId,
      reviews: [],
    };
    setLocations([...locations, newLoc]);
    setNewLocation({ name: "", type: "country", parentId: undefined });
    setIsAddingLocation(false);
  };

  const addReview = (locationId: string, perspective: Perspective) => {
    const updatedLocations = locations.map((location) => {
      if (location.id === locationId) {
        const review: Review = {
          id: Date.now().toString(),
          perspective,
          rating: newReview.rating,
          comment: newReview.comment,
          timestamp: new Date().toISOString(),
        };
        return {
          ...location,
          reviews: [...location.reviews, review],
        };
      }
      return location;
    });
    setLocations(updatedLocations);
    setNewReview({ rating: 5, comment: "" });
  };

  const getCurrentLocations = () => {
    if (!currentLocationId) {
      return locations.filter((loc) => !loc.parentId);
    }
    return locations.filter((loc) => loc.parentId === currentLocationId);
  };

  const getCurrentBreadcrumbs = (): Location[] => {
    if (!currentLocationId) return [];
    const currentLocation = locations.find((loc) => loc.id === currentLocationId);
    if (!currentLocation) return [];
    return getBreadcrumbs(currentLocation);
  };

  const handleBreadcrumbClick = (locationId: string) => {
    setCurrentLocationId(locationId);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span>Location Explorer</span>
              {currentLocationId && (
                <Button variant="outline" size="sm" onClick={() => setCurrentLocationId(undefined)}>
                  Back to Top
                </Button>
              )}
            </div>
            <Button onClick={() => setIsAddingLocation(true)}>Add Location</Button>
          </CardTitle>
          {/* Breadcrumbs */}
          {getCurrentBreadcrumbs().length > 0 && (
            <div className="flex items-center text-sm text-gray-500">
              {getCurrentBreadcrumbs().map((loc, index, array) => (
                <React.Fragment key={loc.id}>
                  <button className="hover:text-gray-700 cursor-pointer" onClick={() => handleBreadcrumbClick(loc.id)}>
                    {loc.name}
                  </button>
                  {index < array.length - 1 && <ChevronRight className="w-4 h-4 mx-1" />}
                </React.Fragment>
              ))}
            </div>
          )}
        </CardHeader>
        <CardContent>
          {/* Perspective Filters */}
          <div className="flex gap-2 flex-wrap mb-6">
            {PERSPECTIVES.map((perspective) => (
              <Button
                key={perspective}
                variant={selectedPerspectives.has(perspective) ? "default" : "outline"}
                onClick={() => togglePerspective(perspective)}
                className="capitalize">
                {perspective}
              </Button>
            ))}
          </div>

          {/* Add Location Dialog */}
          <Dialog open={isAddingLocation} onOpenChange={setIsAddingLocation}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Location</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Location name"
                  value={newLocation.name}
                  onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                />
                <Select value={newLocation.type} onValueChange={(value: LocationType) => setNewLocation({ ...newLocation, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Location type" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATION_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={newLocation.parentId} onValueChange={(value: string) => setNewLocation({ ...newLocation, parentId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Parent location (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        {loc.name} ({loc.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={addLocation}>Add Location</Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Location List */}
          <div className="grid gap-4">
            {getCurrentLocations().map((location) => (
              <Card key={location.id} className="p-4 cursor-pointer hover:bg-gray-50" onClick={() => setCurrentLocationId(location.id)}>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{location.name}</h3>
                      <p className="text-sm text-gray-500 capitalize">{location.type.replace("-", " ")}</p>
                      {getAverageRating(location, selectedPerspectives) && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 stroke-yellow-400" />
                          <span>{getAverageRating(location, selectedPerspectives)}</span>
                        </div>
                      )}
                    </div>

                    {/* Review Actions */}
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      {Array.from(selectedPerspectives).map((perspective) => (
                        <Dialog key={perspective}>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="capitalize">
                              Rate ({perspective})
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                Review {location.name} ({perspective})
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-6 h-6 cursor-pointer ${
                                      star <= newReview.rating ? "fill-yellow-400 stroke-yellow-400" : "stroke-gray-300"
                                    }`}
                                    onClick={() => setNewReview({ ...newReview, rating: star })}
                                  />
                                ))}
                              </div>
                              <Input
                                placeholder="Write your review..."
                                value={newReview.comment}
                                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                              />
                              <Button onClick={() => addReview(location.id, perspective)}>Submit Review</Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      ))}
                    </div>
                  </div>

                  {/* Reviews */}
                  <div className="mt-4 space-y-2" onClick={(e) => e.stopPropagation()}>
                    {location.reviews
                      .filter((review) => selectedPerspectives.has(review.perspective))
                      .map((review) => (
                        <div key={review.id} className="border p-2 rounded">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 capitalize">{review.perspective}</span>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: review.rating }).map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-yellow-400 stroke-yellow-400" />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm mt-1">{review.comment}</p>
                        </div>
                      ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationReviewApp;

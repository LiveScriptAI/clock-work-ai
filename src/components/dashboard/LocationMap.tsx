
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";

const LocationMap: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="mr-2 h-5 w-5" />
          Location Verification
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-200 rounded-md h-48 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/-74.5,40,9,0/300x200?access_token=pk.placeholder')] bg-cover bg-center opacity-80"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <MapPin className="h-8 w-8 text-red-500" />
          </div>
          <div className="absolute bottom-2 right-2 bg-white px-2 py-1 rounded text-xs">
            Mock Map - Location Verified
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationMap;

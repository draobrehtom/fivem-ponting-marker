console.log("[ Pointing Server ] ");

let sharingCoordinates = {};
let playerMarkersEnabledFor = [];

let syncPlayer = (id) => {
    if (! (id in playerMarkersEnabledFor)) {
        playerMarkersEnabledFor.push(id);
    }
    emitNet("pointing:updateMarkers", id, Object.values(sharingCoordinates));
};

let desyncPlayer = (id) => {
    if (id in playerMarkersEnabledFor) {
        playerMarkersEnabledFor = playerMarkersEnabledFor.filter(function(item) {
            return item !== id
        });
    }
}

let addSharingCoordinates = (playerId, coords) => {
    sharingCoordinates[source] = coords;
    console.log("sharing marker", playerId, coords);
    playerMarkersEnabledFor.forEach(p => {
        emitNet("pointing:updateMarkers", p, Object.values(sharingCoordinates));
        console.log("pointing:updateMarkers", p);
    });
};

let removeSharingCoordnates = (playerId) => {
    if (sharingCoordinates[source]) {
        delete sharingCoordinates[source];
        console.log("stop sharing marker", source);

        playerMarkersEnabledFor.forEach(p => {
            emitNet("pointing:updateMarkers", p, Object.values(sharingCoordinates));
            console.log("pointing:updateMarkers", p);
        });
    }
};

onNet("pointing:share", (coords) => {
    addSharingCoordinates(source, coords);
});

onNet("pointing:stopShare", () => {
    removeSharingCoordnates(source);
});

on("playerDropped", (reason) => {
    removeSharingCoordnates(source);
    desyncPlayer(source);
});

setInterval(() => {
    console.log(sharingCoordinates);
}, 10000);


onNet("pointing:sync", () => {
    console.log("pointing:sync", source);
    syncPlayer(source);
});

onNet("pointing:desync", () => {
    console.log("pointing:desync", source);
    desyncPlayer(source);
});
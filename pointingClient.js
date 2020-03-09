/*
    Credits:

    Raycasting - https://github.com/Naikzer/HUD-GTAVRP/blob/4e785178921ce9fe1311bb5be2932bb99d53cc0a/target/client.lua

 */ 

let allMarkersCoordinates = [];
let showSharedMarkers = false;

/**
 * Send player id to server
 */
emitNet("pointing:sync");

/**
 * Receive markers to sync
 */
onNet("pointing:updateMarkers", (coords) => {
    console.log("pointing:updateMarkers", coords);
    allMarkersCoordinates = coords;
});

// RegisterCommand("showmarkers", (source, args) => {
//     if (args[0] && args[0] != 0) {
//         showSharedMarkers = true;
//         emitNet("pointing:sync");
//     } else {
//         showSharedMarkers = false;
//         emitNet("pointing:desync");
//     }
// }, false);


let isPointing = false;
let distance = 5;
let isSharing = false;
let sharingCoordinates;
let share = () => {
    sharingCoordinates = getPointerCoordinates();
    emitNet("pointing:share", sharingCoordinates);
    console.log("Sharing coordinates:", sharingCoordinates);
};

let stopShare = () => {
    emitNet("pointing:stopShare");
    sharingCoordinates = undefined;
}

let toggleSharing = () => {
    isSharing = ! isSharing;
    if (isSharing) {
        share();
    } else {
        stopShare();
    }
};

let GetCoordsFromCam = (distance) => {
    let rot = GetGameplayCamRot(2)
    let coord = GetGameplayCamCoord()

    let tZ = rot[2] * 0.0174532924
    let tX = rot[0] * 0.0174532924
    let num = Math.abs(Math.cos(tX))
  
    newCoordX = coord[0] + (-Math.sin(tZ)) * (num + distance)
    newCoordY = coord[1] + (Math.cos(tZ)) * (num + distance)
    newCoordZ = coord[2] + (Math.sin(tX) * 8.0)
    return [newCoordX, newCoordY, newCoordZ]    
}


let getPointerCoordinates = () => {
    let camCoords = GetGameplayCamCoord();
    let camRot = GetGameplayCamRot();
    let farCoords = GetCoordsFromCam(distance);
    let r = farCoords;

    let RayHandle = StartShapeTestRay(camCoords[0], camCoords[1], camCoords[2], farCoords[0], farCoords[1], farCoords[2], -1, PlayerPedId(), 0)
    let result = GetRaycastResult(RayHandle)

    // Check target existing
    if (result[2][0] === 0 && result[2][1] === 0 && result[2][2] === 0) {
        r = farCoords;
    } else {
        r = result[2];
    }

    return r;
}

setTick(() => {


    if (isPointing) {
        

        if (IsControlPressed(0, 36)) { //ctrl
            if (distance > 0) {
                distance -= 1;
            }
        } else if (IsControlPressed(0, 21)) { //shift
            if (distance < 70) {
                distance += 1;
            }
        } else if (IsControlJustPressed(0, 25)) { //right click
            share();
        }
        
        let r = getPointerCoordinates();
        
        if (isSharing && sharingCoordinates) {
            r = sharingCoordinates;    // will be received from server
        } else {
            DrawMarker(2, r[0], r[1], r[2], 0.0, 0.0, 0.0, 0.0, 180.0, 0.0, 2.0, 2.0, 2.0, 255, 128, 0, 50, false, true, 2, null, null, false);
        }
    }
});

setTick(() => {
    allMarkersCoordinates.forEach(r => {
        DrawMarker(2, r[0], r[1], r[2], 0.0, 0.0, 0.0, 0.0, 180.0, 0.0, 2.0, 2.0, 2.0, 255, 128, 0, 50, false, true, 2, null, null, false);
    });
});


RegisterCommand("pointing", (source, args) => {
    isPointing = ! isPointing;
    if (isPointing) {

    } else {
        
    }
}, false);

// Get coordinates from mouse click

// Create marker
Config = {}

-- Debug mode (prints to console)
Config.Debug = false

-- Enable dirty money support (black_money account)
Config.DirtyMoney = true

-- Default starting bank balance for new players
Config.StartingBalance = 5000

-- ATM locations (can interact to open bank UI)
Config.ATMs = {
    -- Los Santos
    vector3(147.4, -1035.8, 29.3),
    vector3(-386.7, -2662.5, 6.0),
    vector3(-1205.02, -326.3, 37.8),
    vector3(-1091.5, 2708.6, 18.9),
    vector3(-2071.9, -317.2, 13.3),
    vector3(-3144.3, 1127.5, 20.8),
    vector3(-3241.1, 997.6, 12.5),
    vector3(-1827.2, 784.9, 138.3),
    vector3(-846.3, -340.2, 38.7),
    vector3(-721.0, -415.5, 34.9),
    vector3(-254.4, -692.5, 33.6),
    vector3(-203.8, -861.3, 30.3),
    vector3(112.5, -776.3, 31.4),
    vector3(112.9, -818.7, 31.3),
    vector3(119.0, -883.7, 31.1),
    vector3(89.6, 2.4, 68.3),
    vector3(285.5, 143.4, 104.2),
    vector3(357.1, 173.6, 103.1),
    vector3(1138.2, -468.9, 66.7),
    vector3(1077.7, -776.5, 58.2),
    vector3(1153.7, -326.8, 69.2),
    vector3(1167.0, -456.0, 66.8),
    vector3(1686.7, 4815.8, 42.0),
    vector3(1701.2, 6426.5, 32.7),
    vector3(1822.6, 3683.1, 34.2),
    vector3(540.0, 2671.0, 42.2),
    vector3(2564.5, 2584.8, 38.1),
    vector3(2558.7, 349.6, 108.6),
    vector3(2683.1, 3286.5, 55.2),
    vector3(1171.5, 2702.5, 38.2),
    vector3(1172.4, 2702.6, 38.2),
    vector3(-302.4, -829.3, 32.4),
    vector3(5.2, -919.8, 29.6),
    vector3(296.1, -896.2, 29.2),
    vector3(527.2, -160.7, 57.1),
    vector3(-867.8, -186.8, 37.8),
    vector3(-1410.7, -98.9, 52.4),
    vector3(-1410.3, -100.4, 52.4),
    vector3(-1205.8, -324.8, 37.9),
    vector3(-2072.4, -316.9, 13.3),
    vector3(-712.9, -818.4, 23.7),
    vector3(-526.6, -1222.9, 18.5),
    vector3(-256.2, -715.9, 33.5),
    vector3(-203.9, -861.0, 30.3),
    vector3(129.2, -1292.5, 29.3),
    vector3(289.0, -1256.8, 29.4),
    vector3(1686.8, 4815.8, 42.0),
    vector3(-1091.4, 2708.5, 18.9)
}

-- ATM marker settings
Config.ATMMarker = {
    Type = 1,
    Size = {x = 1.5, y = 1.5, z = 1.0},
    Color = {r = 0, g = 150, b = 255, a = 100},
    BobUpAndDown = false,
    FaceCamera = false,
    Rotate = false
}

-- Bank branch locations (physical banks with blips)
Config.Banks = {
    {
        name = "Pacific Standard Bank",
        coords = vector3(150.27, -1040.22, 29.37),
        blip = true
    },
    {
        name = "Fleeca Bank (Alta)",
        coords = vector3(311.18, -279.09, 54.16),
        blip = true
    },
    {
        name = "Fleeca Bank (Burton)",
        coords = vector3(-351.26, -50.27, 49.04),
        blip = true
    },
    {
        name = "Fleeca Bank (Hawick)",
        coords = vector3(-1213.07, -331.38, 37.78),
        blip = true
    },
    {
        name = "Fleeca Bank (Del Perro)",
        coords = vector3(-2962.60, 482.93, 15.70),
        blip = true
    },
    {
        name = "Fleeca Bank (Great Ocean Highway)",
        coords = vector3(-112.81, 6469.91, 31.63),
        blip = true
    },
    {
        name = "Fleeca Bank (Route 68)",
        coords = vector3(1175.02, 2706.87, 38.09),
        blip = true
    },
    {
        name = "Fleeca Bank (Harmony)",
        coords = vector3(1653.48, 4848.09, 42.02),
        blip = true
    }
}

-- Bank marker settings
Config.BankMarker = {
    Type = 20,
    Size = {x = 1.5, y = 1.5, z = 1.0},
    Color = {r = 0, g = 200, b = 0, a = 100},
    BobUpAndDown = false,
    FaceCamera = false,
    Rotate = true
}

-- Bank blip settings
Config.BankBlip = {
    Sprite = 108,
    Color = 2,
    Scale = 0.8,
    Display = 4,
    Name = "Bank"
}

-- Interaction distance
Config.InteractionDistance = 2.0

-- Transaction fee settings (optional)
Config.TransferFee = {
    Enabled = false,
    Percentage = 1, -- 1% fee
    Minimum = 10    -- Minimum $10 fee
}

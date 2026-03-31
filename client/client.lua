local isNearATM = false
local isNearBank = false
local currentATM = nil
local currentBank = nil
local playerData = nil
local bankBlips = {}

-- Debug print
local function DebugPrint(msg)
    if Config.Debug then
        print('^3[BANK DEBUG]^7 ' .. msg)
    end
end

-- Create bank blips
CreateThread(function()
    for i, bank in ipairs(Config.Banks) do
        if bank.blip then
            local blip = AddBlipForCoord(bank.coords.x, bank.coords.y, bank.coords.z)
            SetBlipSprite(blip, Config.BankBlip.Sprite)
            SetBlipColour(blip, Config.BankBlip.Color)
            SetBlipScale(blip, Config.BankBlip.Scale)
            SetBlipDisplay(blip, Config.BankBlip.Display)
            SetBlipAsShortRange(blip, true)
            BeginTextCommandSetBlipName("STRING")
            AddTextComponentString(bank.name)
            EndTextCommandSetBlipName(blip)
            bankBlips[i] = blip
            DebugPrint('Created blip for ' .. bank.name)
        end
    end
end)

-- Distance check helper
local function GetDistance(coords1, coords2)
    return #(coords1 - coords2)
end

-- Open bank UI
local function OpenBank()
    if NUI.IsOpen() then return end
    
    -- Hide text UI if visible
    if isNearATM or isNearBank then
        lib.hideTextUI()
    end
    
    ESX.TriggerServerCallback('bank:getPlayerData', function(data)
        if data then
            playerData = data
            NUI.Open(data)
            DebugPrint('Bank UI opened')
        end
    end)
end

-- Close bank UI
local function CloseBank()
    NUI.Close()
    
    -- Re-show text UI if still near ATM/Bank
    Wait(100)
    if isNearATM then
        lib.showTextUI('[E] Open ATM', {
            position = 'right-center',
            icon = 'credit-card'
        })
    elseif isNearBank then
        lib.showTextUI('[E] Open Bank', {
            position = 'right-center',
            icon = 'building-columns'
        })
    end
    
    DebugPrint('Bank UI closed')
end

-- ATM marker thread
CreateThread(function()
    while true do
        local sleep = 1000
        local playerPed = PlayerPedId()
        local playerCoords = GetEntityCoords(playerPed)
        local nearATM = false
        
        for _, atmCoords in ipairs(Config.ATMs) do
            local distance = GetDistance(playerCoords, atmCoords)
            
            if distance < 50.0 then
                sleep = 0
                DrawMarker(
                    Config.ATMMarker.Type,
                    atmCoords.x, atmCoords.y, atmCoords.z - 1.0,
                    0.0, 0.0, 0.0,
                    0.0, 0.0, 0.0,
                    Config.ATMMarker.Size.x, Config.ATMMarker.Size.y, Config.ATMMarker.Size.z,
                    Config.ATMMarker.Color.r, Config.ATMMarker.Color.g, Config.ATMMarker.Color.b, Config.ATMMarker.Color.a,
                    Config.ATMMarker.BobUpAndDown,
                    Config.ATMMarker.FaceCamera,
                    2,
                    Config.ATMMarker.Rotate,
                    nil, nil, false
                )
            end
            
            if distance < Config.InteractionDistance then
                nearATM = true
                currentATM = atmCoords
                
                if not isNearATM then
                    isNearATM = true
                    lib.showTextUI('[E] Open ATM', {
                        position = 'right-center',
                        icon = 'credit-card'
                    })
                end
                
                if IsControlJustReleased(0, 38) then -- E key
                    OpenBank()
                end
                
                break
            end
        end
        
        if not nearATM and isNearATM then
            isNearATM = false
            currentATM = nil
            lib.hideTextUI()
        end
        
        Wait(sleep)
    end
end)

-- Bank branch marker thread
CreateThread(function()
    while true do
        local sleep = 1000
        local playerPed = PlayerPedId()
        local playerCoords = GetEntityCoords(playerPed)
        local nearBank = false
        
        for _, bank in ipairs(Config.Banks) do
            local distance = GetDistance(playerCoords, bank.coords)
            
            if distance < 50.0 then
                sleep = 0
                DrawMarker(
                    Config.BankMarker.Type,
                    bank.coords.x, bank.coords.y, bank.coords.z - 1.0,
                    0.0, 0.0, 0.0,
                    0.0, 0.0, 0.0,
                    Config.BankMarker.Size.x, Config.BankMarker.Size.y, Config.BankMarker.Size.z,
                    Config.BankMarker.Color.r, Config.BankMarker.Color.g, Config.BankMarker.Color.b, Config.BankMarker.Color.a,
                    Config.BankMarker.BobUpAndDown,
                    Config.BankMarker.FaceCamera,
                    2,
                    Config.BankMarker.Rotate,
                    nil, nil, false
                )
            end
            
            if distance < Config.InteractionDistance then
                nearBank = true
                currentBank = bank
                
                if not isNearBank then
                    isNearBank = true
                    lib.showTextUI('[E] Open Bank', {
                        position = 'right-center',
                        icon = 'building-columns'
                    })
                end
                
                if IsControlJustReleased(0, 38) then -- E key
                    OpenBank()
                end
                
                break
            end
        end
        
        if not nearBank and isNearBank then
            isNearBank = false
            currentBank = nil
            lib.hideTextUI()
        end
        
        Wait(sleep)
    end
end)

-- Commands
RegisterCommand('bank', function()
    if not isNearATM and not isNearBank then
        ESX.ShowNotification('You must be near an ATM or bank', 'error')
        return
    end
    OpenBank()
end)

-- NUI Callbacks
RegisterNuiCallback('deposit', function(data, cb)
    ESX.TriggerServerCallback('bank:deposit', function(response)
        if response.success and response.data then
            playerData.player = response.data
            NUI.SendMessage('updateBalance', response.data)
        end
        cb(response)
    end, data.amount, data.accountType)
end)

RegisterNuiCallback('withdraw', function(data, cb)
    ESX.TriggerServerCallback('bank:withdraw', function(response)
        if response.success and response.data then
            playerData.player = response.data
            NUI.SendMessage('updateBalance', response.data)
        end
        cb(response)
    end, data.amount, data.accountType)
end)

RegisterNuiCallback('transfer', function(data, cb)
    ESX.TriggerServerCallback('bank:transfer', function(response)
        if response.success and response.data then
            playerData.player = response.data
            NUI.SendMessage('updateBalance', response.data)
            
            -- Refresh transaction history
            ESX.TriggerServerCallback('bank:getPlayerData', function(updatedData)
                if updatedData then
                    NUI.SendMessage('updateTransactions', updatedData.transactions)
                end
            end)
        end
        cb(response)
    end, data.targetId, data.amount)
end)

RegisterNuiCallback('societyWithdraw', function(data, cb)
    ESX.TriggerServerCallback('bank:societyWithdraw', function(response)
        if response.success and response.data then
            playerData.player = response.data
            NUI.SendMessage('updateBalance', response.data)
            
            -- Refresh all data to update society balance
            ESX.TriggerServerCallback('bank:getPlayerData', function(updatedData)
                if updatedData then
                    NUI.SendMessage('updateSocieties', updatedData.societies)
                end
            end)
        end
        cb(response)
    end, data.society, data.amount)
end)

RegisterNuiCallback('societyDeposit', function(data, cb)
    ESX.TriggerServerCallback('bank:societyDeposit', function(response)
        if response.success and response.data then
            playerData.player = response.data
            NUI.SendMessage('updateBalance', response.data)
            
            -- Refresh all data to update society balance
            ESX.TriggerServerCallback('bank:getPlayerData', function(updatedData)
                if updatedData then
                    NUI.SendMessage('updateSocieties', updatedData.societies)
                end
            end)
        end
        cb(response)
    end, data.society, data.amount)
end)

RegisterNuiCallback('refreshData', function(_, cb)
    ESX.TriggerServerCallback('bank:getPlayerData', function(data)
        if data then
            playerData = data
            cb(data)
        else
            cb(nil)
        end
    end)
end)

-- Server events
RegisterNetEvent('bank:updateBalance', function(data)
    if NUI.IsOpen() and data then
        playerData.player = data
        NUI.SendMessage('updateBalance', data)
    end
end)

-- Cleanup
AddEventHandler('onResourceStop', function(resourceName)
    if GetCurrentResourceName() ~= resourceName then return end
    
    if NUI.IsOpen() then
        CloseBank()
    end
    
    -- Remove bank blips
    for _, blip in pairs(bankBlips) do
        if DoesBlipExist(blip) then
            RemoveBlip(blip)
        end
    end
end)

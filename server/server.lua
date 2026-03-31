local function DebugPrint(msg)
    if Config.Debug then
        print('^3[BANK DEBUG]^7 ' .. msg)
    end
end

-- Initialize database table on resource start
CreateThread(function()
    MySQL.query([[
        CREATE TABLE IF NOT EXISTS bank_transactions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            identifier VARCHAR(60) NOT NULL,
            transaction_type VARCHAR(20) NOT NULL,
            amount INT NOT NULL,
            balance_after INT NOT NULL,
            target_identifier VARCHAR(60) DEFAULT NULL,
            society VARCHAR(60) DEFAULT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_identifier (identifier),
            INDEX idx_timestamp (timestamp)
        )
    ]])
    DebugPrint('Database initialized')
end)

-- Log transaction to database
local function LogTransaction(identifier, transactionType, amount, balanceAfter, targetIdentifier, society)
    MySQL.insert('INSERT INTO bank_transactions (identifier, transaction_type, amount, balance_after, target_identifier, society) VALUES (?, ?, ?, ?, ?, ?)',
        {identifier, transactionType, amount, balanceAfter, targetIdentifier, society}
    )
end

-- Get player's bank balance
local function GetPlayerBankBalance(xPlayer)
    local account = xPlayer.getAccount('bank')
    return account and account.money or 0
end

-- Get player's cash balance
local function GetPlayerCash(xPlayer)
    return xPlayer.getMoney()
end

-- Get player's dirty money balance
local function GetPlayerDirtyMoney(xPlayer)
    if not Config.DirtyMoney then return 0 end
    local account = xPlayer.getAccount('black_money')
    return account and account.money or 0
end

-- Validate amount
local function IsValidAmount(amount)
    return type(amount) == 'number' and amount > 0 and amount <= 999999999
end

-- Get player data for UI
local function GetPlayerData(xPlayer)
    return {
        cash = GetPlayerCash(xPlayer),
        bank = GetPlayerBankBalance(xPlayer),
        dirtyMoney = GetPlayerDirtyMoney(xPlayer),
        name = xPlayer.getName(),
        identifier = xPlayer.identifier
    }
end

-- Get society account data
local function GetSocietyAccounts(xPlayer)
    local job = xPlayer.job
    local accounts = {}
    
    if job and job.name ~= 'unemployed' then
        TriggerEvent('esx_society:getSociety', job.name, function(society)
            if society then
                TriggerEvent('esx_society:getAccount', job.name, function(account)
                    if account then
                        table.insert(accounts, {
                            name = job.label,
                            jobName = job.name,
                            balance = account.money,
                            isBoss = job.grade_name == 'boss',
                            canWithdraw = job.grade_name == 'boss'
                        })
                    end
                end)
            end
        end)
    end
    
    return accounts
end

-- Get recent transactions
local function GetRecentTransactions(identifier, limit)
    local result = MySQL.query.await(
        'SELECT * FROM bank_transactions WHERE identifier = ? OR target_identifier = ? ORDER BY timestamp DESC LIMIT ?',
        {identifier, identifier, limit or 20}
    )
    return result or {}
end

-- CALLBACKS --

ESX.RegisterServerCallback('bank:getPlayerData', function(source, cb)
    local xPlayer = ESX.GetPlayerFromId(source)
    if not xPlayer then return cb(nil) end
    
    local data = GetPlayerData(xPlayer)
    local societies = GetSocietyAccounts(xPlayer)
    local transactions = GetRecentTransactions(xPlayer.identifier, 20)
    
    Wait(100) -- Small delay for society callback
    
    cb({
        player = data,
        societies = societies,
        transactions = transactions
    })
    
    DebugPrint('Player data sent to ' .. GetPlayerName(source))
end)

ESX.RegisterServerCallback('bank:deposit', function(source, cb, amount, accountType)
    local xPlayer = ESX.GetPlayerFromId(source)
    if not xPlayer then return cb({success = false, message = 'Player not found'}) end
    
    if not IsValidAmount(amount) then
        return cb({success = false, message = 'Invalid amount'})
    end
    
    local sourceBalance = 0
    local canAfford = false
    
    if accountType == 'cash' then
        sourceBalance = GetPlayerCash(xPlayer)
        canAfford = sourceBalance >= amount
    elseif accountType == 'dirty' and Config.DirtyMoney then
        sourceBalance = GetPlayerDirtyMoney(xPlayer)
        canAfford = sourceBalance >= amount
    else
        return cb({success = false, message = 'Invalid account type'})
    end
    
    if not canAfford then
        return cb({success = false, message = 'Insufficient funds'})
    end
    
    -- Perform transaction
    if accountType == 'cash' then
        xPlayer.removeMoney(amount)
    else
        xPlayer.removeAccountMoney('black_money', amount)
    end
    
    xPlayer.addAccountMoney('bank', amount)
    
    local newBalance = GetPlayerBankBalance(xPlayer)
    LogTransaction(xPlayer.identifier, 'deposit_' .. accountType, amount, newBalance, nil, nil)
    
    cb({
        success = true,
        message = 'Deposited $' .. amount,
        data = GetPlayerData(xPlayer)
    })
    
    DebugPrint(GetPlayerName(source) .. ' deposited $' .. amount .. ' from ' .. accountType)
end)

ESX.RegisterServerCallback('bank:withdraw', function(source, cb, amount, accountType)
    local xPlayer = ESX.GetPlayerFromId(source)
    if not xPlayer then return cb({success = false, message = 'Player not found'}) end
    
    if not IsValidAmount(amount) then
        return cb({success = false, message = 'Invalid amount'})
    end
    
    local bankBalance = GetPlayerBankBalance(xPlayer)
    if bankBalance < amount then
        return cb({success = false, message = 'Insufficient bank balance'})
    end
    
    -- Perform transaction
    xPlayer.removeAccountMoney('bank', amount)
    
    if accountType == 'cash' then
        xPlayer.addMoney(amount)
    elseif accountType == 'dirty' and Config.DirtyMoney then
        xPlayer.addAccountMoney('black_money', amount)
    else
        return cb({success = false, message = 'Invalid account type'})
    end
    
    local newBalance = GetPlayerBankBalance(xPlayer)
    LogTransaction(xPlayer.identifier, 'withdraw_' .. accountType, amount, newBalance, nil, nil)
    
    cb({
        success = true,
        message = 'Withdrew $' .. amount,
        data = GetPlayerData(xPlayer)
    })
    
    DebugPrint(GetPlayerName(source) .. ' withdrew $' .. amount .. ' to ' .. accountType)
end)

ESX.RegisterServerCallback('bank:transfer', function(source, cb, targetId, amount)
    local xPlayer = ESX.GetPlayerFromId(source)
    if not xPlayer then return cb({success = false, message = 'Player not found'}) end
    
    if not IsValidAmount(amount) then
        return cb({success = false, message = 'Invalid amount'})
    end
    
    local targetPlayer = ESX.GetPlayerFromId(tonumber(targetId))
    if not targetPlayer then
        return cb({success = false, message = 'Target player not online'})
    end
    
    if source == tonumber(targetId) then
        return cb({success = false, message = 'Cannot transfer to yourself'})
    end
    
    local bankBalance = GetPlayerBankBalance(xPlayer)
    local transferAmount = amount
    
    -- Calculate fee if enabled
    if Config.TransferFee.Enabled then
        local fee = math.max(Config.TransferFee.Minimum, math.floor(amount * (Config.TransferFee.Percentage / 100)))
        transferAmount = amount + fee
    end
    
    if bankBalance < transferAmount then
        return cb({success = false, message = 'Insufficient funds (including fees)'})
    end
    
    -- Perform transaction
    xPlayer.removeAccountMoney('bank', transferAmount)
    targetPlayer.addAccountMoney('bank', amount)
    
    local newBalance = GetPlayerBankBalance(xPlayer)
    LogTransaction(xPlayer.identifier, 'transfer_sent', amount, newBalance, targetPlayer.identifier, nil)
    LogTransaction(targetPlayer.identifier, 'transfer_received', amount, GetPlayerBankBalance(targetPlayer), xPlayer.identifier, nil)
    
    -- Notify target player
    targetPlayer.showNotification('Received $' .. amount .. ' from ' .. xPlayer.getName(), 'success')
    TriggerClientEvent('bank:updateBalance', targetPlayer.source, GetPlayerData(targetPlayer))
    
    cb({
        success = true,
        message = 'Transferred $' .. amount .. ' to ' .. targetPlayer.getName(),
        data = GetPlayerData(xPlayer)
    })
    
    DebugPrint(GetPlayerName(source) .. ' transferred $' .. amount .. ' to ' .. GetPlayerName(targetPlayer.source))
end)

ESX.RegisterServerCallback('bank:societyWithdraw', function(source, cb, societyName, amount)
    local xPlayer = ESX.GetPlayerFromId(source)
    if not xPlayer then return cb({success = false, message = 'Player not found'}) end
    
    if not IsValidAmount(amount) then
        return cb({success = false, message = 'Invalid amount'})
    end
    
    if xPlayer.job.name ~= societyName or xPlayer.job.grade_name ~= 'boss' then
        return cb({success = false, message = 'You do not have permission'})
    end
    
    TriggerEvent('esx_society:getAccount', societyName, function(account)
        if not account then
            return cb({success = false, message = 'Society account not found'})
        end
        
        if account.money < amount then
            return cb({success = false, message = 'Insufficient society funds'})
        end
        
        -- Perform transaction
        TriggerEvent('esx_society:withdrawMoney', societyName, amount)
        xPlayer.addAccountMoney('bank', amount)
        
        local newBalance = GetPlayerBankBalance(xPlayer)
        LogTransaction(xPlayer.identifier, 'society_withdraw', amount, newBalance, nil, societyName)
        
        cb({
            success = true,
            message = 'Withdrew $' .. amount .. ' from ' .. societyName,
            data = GetPlayerData(xPlayer)
        })
        
        DebugPrint(GetPlayerName(source) .. ' withdrew $' .. amount .. ' from society ' .. societyName)
    end)
end)

ESX.RegisterServerCallback('bank:societyDeposit', function(source, cb, societyName, amount)
    local xPlayer = ESX.GetPlayerFromId(source)
    if not xPlayer then return cb({success = false, message = 'Player not found'}) end
    
    if not IsValidAmount(amount) then
        return cb({success = false, message = 'Invalid amount'})
    end
    
    if xPlayer.job.name ~= societyName then
        return cb({success = false, message = 'You are not employed by this society'})
    end
    
    local bankBalance = GetPlayerBankBalance(xPlayer)
    if bankBalance < amount then
        return cb({success = false, message = 'Insufficient bank balance'})
    end
    
    TriggerEvent('esx_society:getAccount', societyName, function(account)
        if not account then
            return cb({success = false, message = 'Society account not found'})
        end
        
        -- Perform transaction
        xPlayer.removeAccountMoney('bank', amount)
        TriggerEvent('esx_society:depositMoney', societyName, amount)
        
        local newBalance = GetPlayerBankBalance(xPlayer)
        LogTransaction(xPlayer.identifier, 'society_deposit', amount, newBalance, nil, societyName)
        
        cb({
            success = true,
            message = 'Deposited $' .. amount .. ' to ' .. societyName,
            data = GetPlayerData(xPlayer)
        })
        
        DebugPrint(GetPlayerName(source) .. ' deposited $' .. amount .. ' to society ' .. societyName)
    end)
end)

-- EXPORTS --

exports('GetBalance', function(source)
    local xPlayer = ESX.GetPlayerFromId(source)
    if not xPlayer then return 0 end
    return GetPlayerBankBalance(xPlayer)
end)

exports('AddMoney', function(source, amount)
    local xPlayer = ESX.GetPlayerFromId(source)
    if not xPlayer or not IsValidAmount(amount) then return false end
    
    xPlayer.addAccountMoney('bank', amount)
    local newBalance = GetPlayerBankBalance(xPlayer)
    LogTransaction(xPlayer.identifier, 'admin_add', amount, newBalance, nil, nil)
    TriggerClientEvent('bank:updateBalance', source, GetPlayerData(xPlayer))
    return true
end)

exports('RemoveMoney', function(source, amount)
    local xPlayer = ESX.GetPlayerFromId(source)
    if not xPlayer or not IsValidAmount(amount) then return false end
    
    local balance = GetPlayerBankBalance(xPlayer)
    if balance < amount then return false end
    
    xPlayer.removeAccountMoney('bank', amount)
    local newBalance = GetPlayerBankBalance(xPlayer)
    LogTransaction(xPlayer.identifier, 'admin_remove', amount, newBalance, nil, nil)
    TriggerClientEvent('bank:updateBalance', source, GetPlayerData(xPlayer))
    return true
end)

-- Update balance event
RegisterNetEvent('bank:requestUpdate', function()
    local xPlayer = ESX.GetPlayerFromId(source)
    if xPlayer then
        TriggerClientEvent('bank:updateBalance', source, GetPlayerData(xPlayer))
    end
end)

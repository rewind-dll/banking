fx_version 'cerulean'
game 'gta5'

author 'rewind.dll'
description 'Complete banking system with NUI, ATMs, and society support'
version '1.1.5'

shared_scripts {
    '@es_extended/imports.lua',
    '@ox_lib/init.lua',
    'config.lua'
}

client_scripts {
    'client/nui.lua',
    'client/client.lua'
}

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server/server.lua'
}

ui_page 'web/dist/index.html'

files {
    'web/dist/**/*'
}

dependencies {
    'es_extended',
    'oxmysql',
    'esx_society',
    'ox_lib'
}

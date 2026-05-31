import sys
sys.stdout.reconfigure(encoding='utf-8')
f = open(r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\engine.js', encoding='utf-8').read()

old_spawn = """      state.equipped.body   = { name:'Worn Leather Jerkin' };
      state.equipped.feet   = { name:'Scuffed Travelling Boots' };
      state.equipped.weapon = { name:'Battered Shortsword' };
      const ri = [
        {name:'Tarnished Lucky Coin'},{name:'Half-eaten Wedge of Cheese'},
        {name:'Crumpled Letter (unread)'},{name:'Small Vial of Unknown Liquid'},
        {name:'Crow Feather (suspiciously large)'},{name:'Snapped Compass Needle'},
        {name:'Dried Sprig of Wolfsbane'}
      ];
      state.inventory = [{ name:'Heel of Bread' }, ri[Math.floor(Math.random() * ri.length)]];"""

new_spawn = """      state.equipped.body    = { name:'Worn Leather Jerkin' };
      state.equipped.feet    = { name:'Scuffed Travelling Boots' };
      state.equipped.weapon  = { name:'Battered Shortsword' };
      state.equipped.offhand = { name:'Dented Wooden Shield', valueCp:80 };
      const mundane = [
        {name:'Heel of Bread', valueCp:2},
        {name:'Stub of Candle', valueCp:3},
        {name:'Coil of Thin Rope', valueCp:15},
        {name:'Worn Whetstone', valueCp:10},
        {name:'Pouch of Salt', valueCp:12},
        {name:'Small Tin Flask (empty)', valueCp:8},
        {name:'Crumpled Letter (unread)', valueCp:0},
        {name:'Folded Piece of Cloth', valueCp:5},
      ];
      const weird = [
        {name:'A Tooth (not yours)', valueCp:0},
        {name:'Tiny Jar of Humming Dirt', valueCp:0},
        {name:'Perfectly Smooth Black Stone', valueCp:0},
        {name:'Dried Hand (severed, child-sized)', valueCp:0},
        {name:'Vial of Liquid That Moves on Its Own', valueCp:0},
        {name:'Brass Button Engraved With a Face', valueCp:0},
        {name:'Small Cage Containing Nothing', valueCp:0},
        {name:'Letter Sealed With Wax, Addressed To You', valueCp:0},
        {name:'Coin From No Known Mint', valueCp:0},
        {name:'Finger Bone With a Ring Still On It', valueCp:0},
      ];
      const shuffle = arr => arr.slice().sort(() => Math.random() - 0.5);
      const pickedMundane = shuffle(mundane).slice(0, 2);
      const pickedWeird = shuffle(weird)[0];
      state.inventory = [
        { name:'Iron Dagger', valueCp:120 },
        ...pickedMundane,
        pickedWeird,
      ];"""

if old_spawn in f:
    f = f.replace(old_spawn, new_spawn)
    open(r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\engine.js', 'w', encoding='utf-8').write(f)
    print('Done.')
else:
    print('NOT FOUND')

import os
import pathlib

os.chdir(pathlib.Path(__file__).parent)

swaps = {
 "https://media.base44.com/images/public/6ad6dfe75ae5eedefbd62633/cf08f27bd_generated_image.png": "/plates/cover.png",
 "https://media.base44.com/images/public/6ad6dfe75ae5eedefbd62633/490712c0e_generated_image.png": "/plates/eyelid.png",
 "https://base44.app/api/apps/6ad6dfe75ae5eedefbd62633/files/mp/public/6ad6dfe75ae5eedefbd62633/b96eb61b5_knowledge-cutout.png": "/plates/knowledge-cutout.png",
 "https://base44.app/api/apps/6ad6dfe75ae5eedefbd62633/files/mp/public/6ad6dfe75ae5eedefbd62633/7f3191b71_creativity-easel.png": "/plates/creativity-easel.png",
 "https://base44.app/api/apps/6ad6dfe75ae5eedefbd62633/files/mp/public/6ad6dfe75ae5eedefbd62633/5b420c8b2_observation-animal-plate.png": "/plates/observation-animal-plate.png",
 "https://base44.app/api/apps/6ad6dfe75ae5eedefbd62633/files/mp/public/6ad6dfe75ae5eedefbd62633/35ba61eaf_storytelling-cutout.png": "/plates/storytelling-cutout.png",
 "https://base44.app/api/apps/6ad6dfe75ae5eedefbd62633/files/mp/public/6ad6dfe75ae5eedefbd62633/16d6cff27_catalogue-cutout.png": "/plates/catalogue-cutout.png",
 "https://base44.app/api/apps/6ad6dfe75ae5eedefbd62633/files/mp/public/6ad6dfe75ae5eedefbd62633/d2fe35a05_observation-magnifier-art.png": "/plates/observation-magnifier-art.png",
 "https://base44.app/api/apps/6ad6dfe75ae5eedefbd62633/files/mp/public/6ad6dfe75ae5eedefbd62633/4682d00b8_observation-telescope-art.png": "/plates/observation-telescope-art.png",
 "https://base44.app/api/apps/6ad6dfe75ae5eedefbd62633/files/mp/public/6ad6dfe75ae5eedefbd62633/dfdafa66a_creativity-brush.png": "/plates/creativity-brush.png",
}
count = 0
for f in ["src/data/gifts.js", "src/data/creativity.js", "src/components/ObservationSpecimen.jsx", "src/components/MagnifyingGlass.jsx", "src/components/Eyelid.jsx"]:
    p = pathlib.Path(f)
    t = p.read_text(encoding="utf-8")
    for old, new in swaps.items():
        if old in t:
            t = t.replace(old, new)
            count += 1
    p.write_text(t, encoding="utf-8")
print("urls replaced:", count)

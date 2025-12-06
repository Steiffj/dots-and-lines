#!/bin/bash
# pushd
cd "$(dirname $0)"
./flatc.exe --ts -o ../src/flatbuffers/gen ./schemas/graph.fbs
# popd

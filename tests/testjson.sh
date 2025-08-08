#! /bin/bash
rm -rvf *.json
./refresh.sh
python3 testjson.py
python3 viewdata.py
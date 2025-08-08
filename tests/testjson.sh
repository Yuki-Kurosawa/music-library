#! /bin/bash
./refresh.sh
rm -rvf *.json
python3 testjson.py
python3 viewdata.py
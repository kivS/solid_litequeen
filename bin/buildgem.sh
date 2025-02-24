#!/usr/bin/env bash


echo "Building solid litequeen gem"
gem build -o solid_litequeen.gem


echo "Deploying gem to RubyGems"
gem push solid_litequeen.gem
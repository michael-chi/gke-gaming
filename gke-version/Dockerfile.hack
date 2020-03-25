# Copyright 2019 Google LLC All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

FROM debian:buster
RUN useradd -u 1000 -m server
RUN apt-get update && apt-get install -y curl  && apt-get clean
RUN curl -sL https://deb.nodesource.com/setup_12.x | bash - && \
    apt-get install -y nodejs

WORKDIR /home/server
## RUN mkdir /home/server/examples/nodejs-simple/tests && mkdir /home/server/examples/nodejs-simple/game-core

COPY . .
RUN cd ./tests && \
    npm install ../game-core

RUN chown -R server /home/server
USER 1000
ENTRYPOINT cd /home/server/tests && node test-ws-hack.js

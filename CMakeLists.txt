cmake_minimum_required(VERSION 3.7)
project(Switcheroo)

set(CMAKE_CXX_STANDARD 11)
set(SOURCE_FILES main.cpp)
add_executable(Switcheroo ${SOURCE_FILES})

find_package(PkgConfig REQUIRED)

find_library(WEBKIT webkit2gtk-4.0)
include_directories(/usr/local/include/webkitgtk-4.0)

pkg_check_modules(GTK3 REQUIRED gtk+-3.0)
include_directories(${GTK3_INCLUDE_DIRS})
link_directories(${GTK3_LIBRARY_DIRS})
add_definitions(${GTK3_CFLAGS_OTHER})

pkg_check_modules(SOUP REQUIRED libsoup-2.4)
include_directories(${SOUP_INCLUDE_DIRS})
link_directories(${SOUP_LIBRARY_DIRS})
add_definitions(${SOUP_CFLAGS_OTHER})

target_link_libraries(
        Switcheroo
        ${GTK3_LIBRARIES}
        ${SOUP_LIBRARIES}
        ${WEBKIT})
